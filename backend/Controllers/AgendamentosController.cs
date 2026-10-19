using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Security.Claims;
using Zlora.Data;
using Zlora.Models;

namespace Zlora.Controllers
{
    // Eu protejo a agenda para que somente usuários autenticados consultem ou alterem agendamentos.
    [ApiController]
    [Authorize]
    [Route("api/agendamentos")]
    public class AgendamentosController : ControllerBase
    {
        private readonly ContextMongoDb _context;
        public AgendamentosController(ContextMongoDb context) => _context = context;

        // Eu obtenho a empresa do token para isolar os agendamentos de cada estabelecimento.
        private string? EmpresaId => User.FindFirstValue("empresa_id");

        // Eu permito filtrar a agenda por início e fim para o frontend poder mostrar períodos menores.
        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] DateTime? inicio, [FromQuery] DateTime? fim)
        {
            if (string.IsNullOrWhiteSpace(EmpresaId)) return Forbid();
            if (inicio.HasValue && fim.HasValue && fim.Value < inicio.Value)
                return BadRequest(new { mensagem = "A data final precisa ser posterior à data inicial." });

            var filtro = Builders<Agendamento>.Filter.Eq(a => a.EmpresaId, EmpresaId);
            if (inicio.HasValue) filtro &= Builders<Agendamento>.Filter.Gte(a => a.DataHoraInicio, inicio.Value);
            if (fim.HasValue) filtro &= Builders<Agendamento>.Filter.Lte(a => a.DataHoraInicio, fim.Value);
            return Ok(await _context.Agendamentos.Find(filtro).SortBy(a => a.DataHoraInicio).ToListAsync());
        }

        // Eu procuro o agendamento pelo ID e pela empresa para evitar acesso cruzado.
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            if (!ObjectId.TryParse(id, out _) || string.IsNullOrWhiteSpace(EmpresaId)) return NotFound();
            var agendamento = await _context.Agendamentos.Find(a => a.Id == id && a.EmpresaId == EmpresaId).FirstOrDefaultAsync();
            return agendamento == null ? NotFound() : Ok(agendamento);
        }

        // Eu valido cliente, serviço e intervalo antes de registrar um novo horário.
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Agendamento agendamento)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            if (string.IsNullOrWhiteSpace(EmpresaId)) return Forbid();
            if (!ObjectId.TryParse(agendamento.ClienteId, out _) || !ObjectId.TryParse(agendamento.ServicoId, out _))
                return BadRequest(new { mensagem = "Informe um cliente e um serviço válidos." });
            if (agendamento.DataHoraFim <= agendamento.DataHoraInicio)
                return BadRequest(new { mensagem = "O horário final precisa ser posterior ao inicial." });

            // Eu confirmo que o cliente e o serviço pertencem à empresa autenticada e que o serviço está ativo.
            var clienteExiste = await _context.Clientes.Find(c => c.Id == agendamento.ClienteId && c.EmpresaId == EmpresaId).AnyAsync();
            var servico = await _context.Servicos.Find(s => s.Id == agendamento.ServicoId && s.EmpresaId == EmpresaId && s.Status == "ativo").FirstOrDefaultAsync();
            if (!clienteExiste || servico == null)
                return BadRequest(new { mensagem = "O cliente ou serviço não existe nesta empresa ou está inativo." });

            // Eu verifico sobreposição de horários para não permitir dois agendamentos simultâneos do mesmo profissional.
            var conflitoFiltro = Builders<Agendamento>.Filter.Eq(a => a.EmpresaId, EmpresaId) &
                Builders<Agendamento>.Filter.Ne(a => a.Status, "cancelado") &
                Builders<Agendamento>.Filter.Lt(a => a.DataHoraInicio, agendamento.DataHoraFim) &
                Builders<Agendamento>.Filter.Gt(a => a.DataHoraFim, agendamento.DataHoraInicio);
            if (!string.IsNullOrWhiteSpace(agendamento.ProfissionalId))
                conflitoFiltro &= Builders<Agendamento>.Filter.Eq(a => a.ProfissionalId, agendamento.ProfissionalId);
            if (await _context.Agendamentos.Find(conflitoFiltro).AnyAsync())
                return Conflict(new { mensagem = "Já existe um agendamento nesse horário para o profissional selecionado." });

            // Eu defino os campos de controle no servidor e não aceito o status enviado pelo frontend.
            agendamento.Id = ObjectId.GenerateNewId().ToString();
            agendamento.EmpresaId = EmpresaId;
            agendamento.Status = "agendado";
            agendamento.CriadoEm = DateTime.UtcNow;
            agendamento.AlteradoEm = DateTime.UtcNow;
            await _context.Agendamentos.InsertOneAsync(agendamento);
            return CreatedAtAction(nameof(GetById), new { id = agendamento.Id }, agendamento);
        }

        // Eu permito o cancelamento dentro da área administrativa; a regra de 24 horas do cliente final ainda precisa do fluxo próprio.
        [HttpPatch("{id}/cancelar")]
        public async Task<IActionResult> Cancel(string id)
        {
            if (!ObjectId.TryParse(id, out _) || string.IsNullOrWhiteSpace(EmpresaId)) return NotFound();
            var agendamento = await _context.Agendamentos.Find(a => a.Id == id && a.EmpresaId == EmpresaId).FirstOrDefaultAsync();
            if (agendamento == null) return NotFound();
            if (agendamento.Status == "cancelado") return BadRequest(new { mensagem = "O agendamento já está cancelado." });
            agendamento.Status = "cancelado";
            agendamento.AlteradoEm = DateTime.UtcNow;
            await _context.Agendamentos.ReplaceOneAsync(a => a.Id == id && a.EmpresaId == EmpresaId, agendamento);
            return Ok(agendamento);
        }
    }
}
