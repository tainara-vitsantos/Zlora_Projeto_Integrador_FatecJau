using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using Zlora.Data;
using Zlora.Models;

namespace Zlora.Controllers
{
    [ApiController]
    [Route("api/publico")]
    public class PublicoController : ControllerBase
    {
        private readonly ContextMongoDb _context;
        public PublicoController(ContextMongoDb context) => _context = context;

        // Busca os dados do salão, serviços e profissionais pelo link (Slug)
        [HttpGet("{slug}")]
        public async Task<IActionResult> GetSalao(string slug)
        {
            var empresa = await _context.Empresas.Find(e => e.Slug == slug && e.Status == "ativa").FirstOrDefaultAsync();
            if (empresa == null) return NotFound(new { mensagem = "Estabelecimento não encontrado." });

            var servicos = await _context.Servicos
                .Find(s => s.EmpresaId == empresa.Id && s.Status == "ativo")
                .SortBy(s => s.Nome).ToListAsync();

            var profissionais = await _context.Profissionais
                .Find(p => p.EmpresaId == empresa.Id && p.Status == "ativo")
                .SortBy(p => p.Nome).ToListAsync();

            return Ok(new
            {
                empresa = new { 
                    id = empresa.Id, nome = empresa.NomeFantasia, slug = empresa.Slug,
                    corPrimaria = empresa.CorPrimaria, logoUrl = empresa.LogoUrl,
                    fotoCapaUrl = empresa.FotoCapaUrl, instagram = empresa.Instagram, endereco = empresa.Endereco
                },
                servicos,
                profissionais // <-- ADICIONADO AQUI
            });
        }

        // Recebe o agendamento feito pelo cliente final (sem login)
        [HttpPost("{slug}/agendar")]
        public async Task<IActionResult> AgendarPublico(string slug, [FromBody] AgendamentoPublicoDto dados)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            var empresa = await _context.Empresas.Find(e => e.Slug == slug && e.Status == "ativa").FirstOrDefaultAsync();
            if (empresa == null) return NotFound(new { mensagem = "Estabelecimento não encontrado." });

            var servico = await _context.Servicos.Find(s => s.Id == dados.ServicoId && s.EmpresaId == empresa.Id).FirstOrDefaultAsync();
            if (servico == null) return BadRequest(new { mensagem = "Serviço não encontrado." });

            // 1. Verifica se o cliente já existe (pelo telefone na empresa)
            var telefoneLimpo = new string(dados.Telefone.Where(char.IsDigit).ToArray());
            var cliente = await _context.Clientes.Find(c => c.EmpresaId == empresa.Id && c.Telefone == telefoneLimpo).FirstOrDefaultAsync();

            if (cliente == null)
            {
                cliente = new Cliente
                {
                    Id = ObjectId.GenerateNewId().ToString(),
                    EmpresaId = empresa.Id!,
                    Nome = dados.Nome,
                    Telefone = telefoneLimpo,
                    Status = "ativo",
                    CriadoEm = DateTime.UtcNow,
                    AlteradoEm = DateTime.UtcNow
                };
                await _context.Clientes.InsertOneAsync(cliente);
            }

            // 2. Calcula a hora de fim
            var dataInicio = dados.DataHoraInicio;
            var dataFim = dataInicio.AddMinutes(servico.DuracaoMinutos);

            // 3. Verifica conflito de horário para o profissional
            if (!string.IsNullOrWhiteSpace(dados.ProfissionalId))
            {
                var conflitoFiltro = Builders<Agendamento>.Filter.Eq(a => a.EmpresaId, empresa.Id) &
                    Builders<Agendamento>.Filter.Eq(a => a.ProfissionalId, dados.ProfissionalId) &
                    Builders<Agendamento>.Filter.Ne(a => a.Status, "cancelado") &
                    Builders<Agendamento>.Filter.Lt(a => a.DataHoraInicio, dataFim) &
                    Builders<Agendamento>.Filter.Gt(a => a.DataHoraFim, dataInicio);
                
                if (await _context.Agendamentos.Find(conflitoFiltro).AnyAsync())
                    return Conflict(new { mensagem = "Este horário já está ocupado para o profissional selecionado. Escolha outro." });
            }

            // 4. Cria o agendamento
            var novoAgendamento = new Agendamento
            {
                Id = ObjectId.GenerateNewId().ToString(),
                EmpresaId = empresa.Id!,
                ClienteId = cliente.Id!,
                ServicoId = servico.Id!,
                ProfissionalId = dados.ProfissionalId,
                DataHoraInicio = dataInicio,
                DataHoraFim = dataFim,
                Status = "agendado",
                CriadoEm = DateTime.UtcNow,
                AlteradoEm = DateTime.UtcNow
            };

            await _context.Agendamentos.InsertOneAsync(novoAgendamento);
            return Ok(new { mensagem = "Agendamento realizado com sucesso!" });
        }
    }

    public class AgendamentoPublicoDto
    {
        public string Nome { get; set; } = "";
        public string Telefone { get; set; } = "";
        public string ServicoId { get; set; } = "";
        public string? ProfissionalId { get; set; }
        public DateTime DataHoraInicio { get; set; }
    }
}