using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Security.Claims;
using Zlora.Data;
using Zlora.Models;
using Zlora.Services;

namespace Zlora.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/agendamentos")]
    public class AgendamentosController : ControllerBase
    {
        private readonly ContextMongoDb _context;
        public AgendamentosController(ContextMongoDb context) => _context = context;

        private string? EmpresaId => User.FindFirstValue("empresa_id");

        // ==========================================
        // ROTAS DO SALÃO (ADMINISTRADOR)
        // ==========================================

        [Authorize(Roles = "administrador")]
        [HttpGet]
        public async Task<IActionResult> Get(
            [FromQuery] DateTime? inicio,
            [FromQuery] DateTime? fim,
            [FromQuery] string? profissionalId,
            [FromQuery] string? status)
        {
            if (string.IsNullOrWhiteSpace(EmpresaId)) return Forbid();
            if (inicio.HasValue && fim.HasValue && fim.Value < inicio.Value)
                return BadRequest(new { mensagem = "A data final precisa ser posterior à data inicial." });

            var filtro = Builders<Agendamento>.Filter.Eq(a => a.EmpresaId, EmpresaId);
            if (inicio.HasValue) filtro &= Builders<Agendamento>.Filter.Gte(a => a.DataHoraInicio, inicio.Value);
            if (fim.HasValue) filtro &= Builders<Agendamento>.Filter.Lte(a => a.DataHoraInicio, fim.Value);
            if (!string.IsNullOrWhiteSpace(profissionalId))
                filtro &= Builders<Agendamento>.Filter.Eq(a => a.ProfissionalId, profissionalId);
            if (!string.IsNullOrWhiteSpace(status) && status != "todos")
                filtro &= Builders<Agendamento>.Filter.Eq(a => a.Status, status);
            return Ok(await _context.Agendamentos.Find(filtro).SortBy(a => a.DataHoraInicio).ToListAsync());
        }

        [Authorize(Roles = "administrador")]
        [HttpGet("disponibilidade")]
        public async Task<IActionResult> GetDisponibilidade(
            [FromQuery] string profissionalId,
            [FromQuery] string servicoId,
            [FromQuery] DateOnly inicio,
            [FromQuery] int dias = 14,
            [FromQuery] int fusoMinutos = 0)
        {
            if (string.IsNullOrWhiteSpace(EmpresaId)) return Forbid();
            if (dias < 1 || dias > 31 || fusoMinutos is < -840 or > 840)
                return BadRequest(new { mensagem = "Período ou fuso horário inválido." });

            var servico = await _context.Servicos.Find(s =>
                s.Id == servicoId && s.EmpresaId == EmpresaId && s.Status == "ativo").FirstOrDefaultAsync();
            var profissional = await _context.Profissionais.Find(p =>
                p.Id == profissionalId && p.EmpresaId == EmpresaId && p.Status == "ativo").FirstOrDefaultAsync();
            if (servico == null || profissional == null)
                return BadRequest(new { mensagem = "Selecione um serviço e profissional ativos." });

            return Ok(await DisponibilidadeAgenda.BuscarAsync(
                _context, profissional, servico.DuracaoMinutos, inicio, dias, fusoMinutos));
        }

        [Authorize(Roles = "administrador")]
        [HttpGet("alteracoes")]
        public async Task<IActionResult> GetAlteracoes(
            [FromQuery] DateTime? inicio,
            [FromQuery] DateTime? fim,
            [FromQuery] string? profissionalId,
            [FromQuery] int limite = 20)
        {
            if (string.IsNullOrWhiteSpace(EmpresaId)) return Forbid();
            if (inicio.HasValue && fim.HasValue && fim.Value < inicio.Value)
                return BadRequest(new { mensagem = "A data final precisa ser posterior à data inicial." });

            var filtro = Builders<AlteracaoAgenda>.Filter.Eq(a => a.EmpresaId, EmpresaId);
            if (inicio.HasValue) filtro &= Builders<AlteracaoAgenda>.Filter.Gte(a => a.CriadoEm, inicio.Value);
            if (fim.HasValue) filtro &= Builders<AlteracaoAgenda>.Filter.Lte(a => a.CriadoEm, fim.Value);
            if (!string.IsNullOrWhiteSpace(profissionalId))
                filtro &= Builders<AlteracaoAgenda>.Filter.Eq(a => a.ProfissionalId, profissionalId);

            return Ok(await _context.AlteracoesAgenda.Find(filtro)
                .SortByDescending(a => a.CriadoEm)
                .Limit(Math.Clamp(limite, 1, 100))
                .ToListAsync());
        }

        [Authorize(Roles = "administrador")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            if (!ObjectId.TryParse(id, out _) || string.IsNullOrWhiteSpace(EmpresaId)) return NotFound();
            var agendamento = await _context.Agendamentos.Find(a => a.Id == id && a.EmpresaId == EmpresaId).FirstOrDefaultAsync();
            return agendamento == null ? NotFound() : Ok(agendamento);
        }

        [Authorize(Roles = "administrador")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Agendamento agendamento)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            if (string.IsNullOrWhiteSpace(EmpresaId)) return Forbid();
            if (!ObjectId.TryParse(agendamento.ClienteId, out _) || !ObjectId.TryParse(agendamento.ServicoId, out _))
                return BadRequest(new { mensagem = "Informe um cliente e um serviço válidos." });
            if (agendamento.DataHoraFim <= agendamento.DataHoraInicio)
                return BadRequest(new { mensagem = "O horário final precisa ser posterior ao inicial." });

            var clienteExiste = await _context.Clientes.Find(c => c.Id == agendamento.ClienteId && c.EmpresaId == EmpresaId).AnyAsync();
            var servico = await _context.Servicos.Find(s => s.Id == agendamento.ServicoId && s.EmpresaId == EmpresaId && s.Status == "ativo").FirstOrDefaultAsync();
            if (!clienteExiste || servico == null)
                return BadRequest(new { mensagem = "O cliente ou serviço não existe nesta empresa ou está inativo." });

            if (string.IsNullOrWhiteSpace(agendamento.ProfissionalId) ||
                !ObjectId.TryParse(agendamento.ProfissionalId, out _))
                return BadRequest(new { mensagem = "Selecione uma profissional válida." });

            var profissional = await _context.Profissionais.Find(p =>
                p.Id == agendamento.ProfissionalId && p.EmpresaId == EmpresaId && p.Status == "ativo").FirstOrDefaultAsync();
            if (profissional == null)
                return BadRequest(new { mensagem = "A profissional selecionada não está ativa nesta empresa." });

            if (agendamento.DataHoraInicio.Kind != DateTimeKind.Utc)
                agendamento.DataHoraInicio = DateTime.SpecifyKind(agendamento.DataHoraInicio, DateTimeKind.Utc);
            var duracao = servico.DuracaoMinutos;
            if (agendamento.DataHoraFim != agendamento.DataHoraInicio.AddMinutes(duracao))
                return BadRequest(new { mensagem = "A duração do agendamento precisa corresponder à duração do serviço." });

            var fusoMinutos = agendamento.FusoMinutos;
            if (fusoMinutos is < -840 or > 840 ||
                !DisponibilidadeAgenda.HorarioPermitido(
                    profissional, agendamento.DataHoraInicio, agendamento.DataHoraFim, fusoMinutos))
                return Conflict(new { mensagem = "O horário escolhido está fora da jornada ou bloqueado." });

            var conflitoFiltro = Builders<Agendamento>.Filter.Eq(a => a.EmpresaId, EmpresaId) &
                Builders<Agendamento>.Filter.Ne(a => a.Status, "cancelado") &
                Builders<Agendamento>.Filter.Lt(a => a.DataHoraInicio, agendamento.DataHoraFim) &
                Builders<Agendamento>.Filter.Gt(a => a.DataHoraFim, agendamento.DataHoraInicio);
            conflitoFiltro &= Builders<Agendamento>.Filter.Eq(a => a.ProfissionalId, agendamento.ProfissionalId);
            if (await _context.Agendamentos.Find(conflitoFiltro).AnyAsync())
                return Conflict(new { mensagem = "Já existe um agendamento nesse horário para o profissional selecionado." });

            agendamento.Id = ObjectId.GenerateNewId().ToString();
            agendamento.EmpresaId = EmpresaId;
            agendamento.Status = "agendado";
            agendamento.CriadoEm = DateTime.UtcNow;
            agendamento.AlteradoEm = DateTime.UtcNow;
            await _context.Agendamentos.InsertOneAsync(agendamento);
            return CreatedAtAction(nameof(GetById), new { id = agendamento.Id }, agendamento);
        }

        [Authorize(Roles = "administrador")]
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

        [Authorize(Roles = "administrador")]
        [HttpPatch("{id}/concluir")]
        public async Task<IActionResult> Concluir(string id)
        {
            if (!ObjectId.TryParse(id, out _) || string.IsNullOrWhiteSpace(EmpresaId)) return NotFound();
            var agendamento = await _context.Agendamentos.Find(a => a.Id == id && a.EmpresaId == EmpresaId).FirstOrDefaultAsync();
            if (agendamento == null) return NotFound();
            if (agendamento.Status == "cancelado") return BadRequest(new { mensagem = "Não é possível concluir um agendamento cancelado." });
            if (agendamento.Status == "concluido") return BadRequest(new { mensagem = "Este agendamento já está concluído." });

            agendamento.Status = "concluido";
            agendamento.AlteradoEm = DateTime.UtcNow;
            await _context.Agendamentos.ReplaceOneAsync(a => a.Id == id && a.EmpresaId == EmpresaId, agendamento);
            return Ok(agendamento);
        }

        // ==========================================
        // ROTAS DO CLIENTE FINAL
        // ==========================================

        [Authorize(Roles = "cliente")]
        [HttpGet("meus")]
        public async Task<IActionResult> GetMeusAgendamentos()
        {
            var email = User.FindFirstValue(ClaimTypes.Email);
            if (string.IsNullOrEmpty(email)) return Unauthorized(new { mensagem = "Usuário não autenticado." });

            var clientes = await _context.Clientes.Find(c => c.Email == email).ToListAsync();
            var clienteIds = clientes.Select(c => c.Id).ToList();
            if (!clienteIds.Any()) return Ok(new List<object>());

            var agendamentos = await _context.Agendamentos.Find(a => clienteIds.Contains(a.ClienteId)).SortByDescending(a => a.DataHoraInicio).ToListAsync();
            var resultado = new List<object>();

            foreach (var ag in agendamentos)
            {
                var servico = await _context.Servicos.Find(s => s.Id == ag.ServicoId).FirstOrDefaultAsync();
                
                // CORREÇÃO AQUI: Ignora o campo JornadaTrabalho
                var profissional = await _context.Profissionais
                    .Find(p => p.Id == ag.ProfissionalId)
                    .Project<Profissional>(Builders<Profissional>.Projection.Exclude(p => p.JornadaTrabalho))
                    .FirstOrDefaultAsync();

                var empresa = await _context.Empresas.Find(e => e.Id == ag.EmpresaId).FirstOrDefaultAsync();

                resultado.Add(new
                {
                    id = ag.Id,
                    dataHoraInicio = ag.DataHoraInicio,
                    status = ag.Status,
                    servicoNome = servico?.Nome ?? "Serviço Excluído",
                    profissionalNome = profissional?.Nome ?? "Profissional Excluído",
                    empresaNome = empresa?.NomeFantasia ?? "Estabelecimento Excluído",
                    empresaSlug = empresa?.Slug ?? ""
                });
            }
            return Ok(resultado);
        }

        [Authorize(Roles = "profissional")]
        [HttpGet("minha")]
        public async Task<IActionResult> GetMinhaAgenda()
        {
            var usuarioId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(usuarioId) || string.IsNullOrWhiteSpace(EmpresaId))
                return Forbid();

            // CORREÇÃO AQUI: Ignora o campo JornadaTrabalho
            var profissional = await _context.Profissionais
                .Find(p => p.UsuarioId == usuarioId && p.EmpresaId == EmpresaId)
                .Project<Profissional>(Builders<Profissional>.Projection.Exclude(p => p.JornadaTrabalho))
                .FirstOrDefaultAsync();

            if (profissional == null)
                return NotFound(new { mensagem = "Cadastro profissional não encontrado." });

            var agendamentos = await _context.Agendamentos
                .Find(a => a.ProfissionalId == profissional.Id && a.EmpresaId == EmpresaId)
                .SortBy(a => a.DataHoraInicio)
                .ToListAsync();

            var resultado = new List<object>();

            foreach (var agendamento in agendamentos)
            {
                var cliente = await _context.Clientes
                    .Find(c => c.Id == agendamento.ClienteId && c.EmpresaId == EmpresaId)
                    .FirstOrDefaultAsync();

                var servico = await _context.Servicos
                    .Find(s => s.Id == agendamento.ServicoId && s.EmpresaId == EmpresaId)
                    .FirstOrDefaultAsync();

                resultado.Add(new
                {
                    id = agendamento.Id,
                    dataHoraInicio = agendamento.DataHoraInicio,
                    dataHoraFim = agendamento.DataHoraFim,
                    clienteNome = cliente?.Nome ?? "Cliente não encontrado",
                    servicoNome = servico?.Nome ?? "Serviço não encontrado",
                    status = agendamento.Status,
                    observacoes = agendamento.Observacoes,
                    alteradoEm = agendamento.AlteradoEm,
                    criadoEm = agendamento.CriadoEm
                });
            }

            return Ok(resultado);
        }
    }
}