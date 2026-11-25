using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using Zlora.Data;
using Zlora.Models;
using Zlora.Services;

namespace Zlora.Controllers
{
    [ApiController]
    [Route("api/publico")]
    public class PublicoController : ControllerBase
    {
        private readonly ContextMongoDb _context;
        public PublicoController(ContextMongoDb context) => _context = context;

        [HttpGet("{slug}")]
        public async Task<IActionResult> GetSalao(string slug)
        {
            var empresa = await _context.Empresas.Find(e => e.Slug == slug && e.Status == "ativa").FirstOrDefaultAsync();
            if (empresa == null) return NotFound(new { mensagem = "Estabelecimento não encontrado." });

            var servicos = await _context.Servicos
                .Find(s => s.EmpresaId == empresa.Id && s.Status == "ativo")
                .SortBy(s => s.Nome).ToListAsync();

            // Ignora o campo JornadaTrabalho na listagem principal
            var profissionais = await _context.Profissionais
                .Find(p => p.EmpresaId == empresa.Id && p.Status == "ativo")
                .Project<Profissional>(Builders<Profissional>.Projection.Exclude(p => p.JornadaTrabalho))
                .SortBy(p => p.Nome).ToListAsync();

            return Ok(new
            {
                empresa = new { 
                    id = empresa.Id, nome = empresa.NomeFantasia, slug = empresa.Slug,
                    corPrimaria = empresa.CorPrimaria, logoUrl = empresa.LogoUrl,
                    fotoCapaUrl = empresa.FotoCapaUrl, instagram = empresa.Instagram, endereco = empresa.Endereco
                },
                servicos,
                profissionais
            });
        }

        [HttpGet("{slug}/profissional/{profissionalId}/horarios")]
        public async Task<IActionResult> GetHorariosProfissionalPublico(string slug, string profissionalId)
        {
            var empresa = await _context.Empresas.Find(e => e.Slug == slug && e.Status == "ativa").FirstOrDefaultAsync();
            if (empresa == null) return NotFound(new { mensagem = "Estabelecimento não encontrado." });

            if (!ObjectId.TryParse(profissionalId, out _)) 
                return BadRequest(new { mensagem = "ID do profissional inválido." });

            // BUSCA BRUTA (BsonDocument) para evitar erros de conversão se o banco tiver dados antigos
            var profissionalDoc = await _context.Profissionais
                .Find(p => p.Id == profissionalId && p.EmpresaId == empresa.Id)
                .Project<BsonDocument>(Builders<Profissional>.Projection.Include("jornada_trabalho"))
                .FirstOrDefaultAsync();

            if (profissionalDoc == null) 
                return NotFound(new { mensagem = "Profissional não encontrado." });

            if (profissionalDoc.Contains("jornada_trabalho") && profissionalDoc["jornada_trabalho"] != BsonNull.Value)
            {
                return Content(profissionalDoc["jornada_trabalho"].ToJson(), "application/json");
            }

            return Ok(new BsonDocument()); // Retorna vazio se não tiver nada
        }

        [HttpGet("{slug}/profissional/{profissionalId}/disponibilidade")]
        public async Task<IActionResult> GetDisponibilidade(
            string slug,
            string profissionalId,
            [FromQuery] string servicoId,
            [FromQuery] DateOnly inicio,
            [FromQuery] int dias = 14,
            [FromQuery] int fusoMinutos = 0)
        {
            var empresa = await _context.Empresas.Find(e => e.Slug == slug && e.Status == "ativa").FirstOrDefaultAsync();
            if (empresa == null) return NotFound(new { mensagem = "Estabelecimento não encontrado." });
            if (!ObjectId.TryParse(profissionalId, out _) || dias is < 1 or > 31 || fusoMinutos is < -840 or > 840)
                return BadRequest(new { mensagem = "Profissional, período ou fuso horário inválido." });

            var servico = await _context.Servicos.Find(s =>
                s.Id == servicoId && s.EmpresaId == empresa.Id && s.Status == "ativo").FirstOrDefaultAsync();
            var profissional = await _context.Profissionais.Find(p =>
                p.Id == profissionalId && p.EmpresaId == empresa.Id && p.Status == "ativo").FirstOrDefaultAsync();
            if (servico == null || profissional == null)
                return BadRequest(new { mensagem = "Serviço ou profissional indisponível." });

            return Ok(await DisponibilidadeAgenda.BuscarAsync(
                _context, profissional, servico.DuracaoMinutos, inicio, dias, fusoMinutos));
        }

        [HttpPost("{slug}/agendar")]
        public async Task<IActionResult> AgendarPublico(string slug, [FromBody] AgendamentoPublicoDto dados)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            var empresa = await _context.Empresas.Find(e => e.Slug == slug && e.Status == "ativa").FirstOrDefaultAsync();
            if (empresa == null) return NotFound(new { mensagem = "Estabelecimento não encontrado." });

            var servico = await _context.Servicos.Find(s => s.Id == dados.ServicoId && s.EmpresaId == empresa.Id).FirstOrDefaultAsync();
            if (servico == null) return BadRequest(new { mensagem = "Serviço não encontrado." });

            if (!ObjectId.TryParse(dados.ProfissionalId, out _) || dados.FusoMinutos is < -840 or > 840)
                return BadRequest(new { mensagem = "Selecione uma profissional válida." });

            var profissional = await _context.Profissionais.Find(p =>
                p.Id == dados.ProfissionalId && p.EmpresaId == empresa.Id && p.Status == "ativo").FirstOrDefaultAsync();
            if (profissional == null)
                return BadRequest(new { mensagem = "A profissional selecionada não está ativa neste estabelecimento." });

            var dataInicio = dados.DataHoraInicio.Kind == DateTimeKind.Utc
                ? dados.DataHoraInicio
                : DateTime.SpecifyKind(dados.DataHoraInicio, DateTimeKind.Utc);
            var dataFim = dataInicio.AddMinutes(servico.DuracaoMinutos);
            if (dataInicio <= DateTime.UtcNow ||
                !DisponibilidadeAgenda.HorarioPermitido(profissional, dataInicio, dataFim, dados.FusoMinutos))
                return Conflict(new { mensagem = "O horário escolhido está fora da jornada, bloqueado ou já passou." });

            var conflitoFiltro = Builders<Agendamento>.Filter.Eq(a => a.EmpresaId, empresa.Id) &
                Builders<Agendamento>.Filter.Eq(a => a.ProfissionalId, profissional.Id) &
                Builders<Agendamento>.Filter.Ne(a => a.Status, "cancelado") &
                Builders<Agendamento>.Filter.Lt(a => a.DataHoraInicio, dataFim) &
                Builders<Agendamento>.Filter.Gt(a => a.DataHoraFim, dataInicio);
            if (await _context.Agendamentos.Find(conflitoFiltro).AnyAsync())
                return Conflict(new { mensagem = "Este horário acabou de ser reservado. Escolha outro horário." });

            var telefoneLimpo = new string(dados.Telefone.Where(char.IsDigit).ToArray());
            var cliente = await _context.Clientes.Find(c => c.EmpresaId == empresa.Id && c.Telefone == telefoneLimpo).FirstOrDefaultAsync();

            if (cliente == null)
            {
                cliente = new Cliente { Id = ObjectId.GenerateNewId().ToString(), EmpresaId = empresa.Id!, Nome = dados.Nome, Telefone = telefoneLimpo, Status = "ativo", CriadoEm = DateTime.UtcNow, AlteradoEm = DateTime.UtcNow };
                await _context.Clientes.InsertOneAsync(cliente);
            }

            var novoAgendamento = new Agendamento
            {
                Id = ObjectId.GenerateNewId().ToString(), EmpresaId = empresa.Id!, ClienteId = cliente.Id!,
                ServicoId = servico.Id!, ProfissionalId = profissional.Id,
                DataHoraInicio = dataInicio, DataHoraFim = dataFim, Status = "agendado",
                CriadoEm = DateTime.UtcNow, AlteradoEm = DateTime.UtcNow
            };

            await _context.Agendamentos.InsertOneAsync(novoAgendamento);
            return Ok(new
            {
                mensagem = "Agendamento realizado com sucesso!",
                agendamentoId = novoAgendamento.Id,
                dataHoraInicio = novoAgendamento.DataHoraInicio,
                status = novoAgendamento.Status
            });
        }

        [HttpPost("{slug}/cadastrar-cliente")]
        public async Task<IActionResult> CadastrarClientePublico(string slug, [FromBody] ClientePublicoDto dados)
        {
            var empresa = await _context.Empresas.Find(e => e.Slug == slug).FirstOrDefaultAsync();
            if (empresa == null) return NotFound(new { mensagem = "Salão não encontrado." });

            var telefoneLimpo = new string(dados.Telefone.Where(char.IsDigit).ToArray());
            var existe = await _context.Clientes.Find(c => c.EmpresaId == empresa.Id && c.Telefone == telefoneLimpo).AnyAsync();
            if (existe) return Conflict(new { mensagem = "Este WhatsApp já está cadastrado." });

            var novoCliente = new Cliente
            {
                Id = ObjectId.GenerateNewId().ToString(), EmpresaId = empresa.Id!, Nome = dados.Nome.Trim(),
                Email = dados.Email?.Trim().ToLowerInvariant(), Telefone = telefoneLimpo, Status = "ativo",
                CriadoEm = DateTime.UtcNow, AlteradoEm = DateTime.UtcNow
            };

            await _context.Clientes.InsertOneAsync(novoCliente);
            return Ok(new { mensagem = "Cadastro realizado com sucesso!" });
        }

        [HttpGet("{slug}/meus-agendamentos")]
        public async Task<IActionResult> GetMeusAgendamentos(string slug, [FromQuery] string telefone)
        {
            if (string.IsNullOrWhiteSpace(telefone)) return BadRequest();
            var empresa = await _context.Empresas.Find(e => e.Slug == slug).FirstOrDefaultAsync();
            if (empresa == null) return NotFound();

            var telefoneLimpo = new string(telefone.Where(char.IsDigit).ToArray());
            var cliente = await _context.Clientes.Find(c => c.EmpresaId == empresa.Id && c.Telefone == telefoneLimpo).FirstOrDefaultAsync();
            if (cliente == null) return Ok(new List<object>());

            var agendamentos = await _context.Agendamentos.Find(a => a.EmpresaId == empresa.Id && a.ClienteId == cliente.Id).SortByDescending(a => a.DataHoraInicio).ToListAsync();
            var resultado = new List<object>();
            foreach (var ag in agendamentos)
            {
                var servico = await _context.Servicos.Find(s => s.Id == ag.ServicoId).FirstOrDefaultAsync();
                var profissional = await _context.Profissionais.Find(p => p.Id == ag.ProfissionalId).FirstOrDefaultAsync();
                resultado.Add(new { id = ag.Id, dataHoraInicio = ag.DataHoraInicio, status = ag.Status, servicoNome = servico?.Nome ?? "Excluído", profissionalNome = profissional?.Nome ?? "Excluído" });
            }
            return Ok(resultado);
        }

        [HttpGet("{slug}/cliente/{telefone}")]
        public async Task<IActionResult> GetPerfilCliente(string slug, string telefone)
        {
            var empresa = await _context.Empresas.Find(e => e.Slug == slug).FirstOrDefaultAsync();
            if (empresa == null) return NotFound();
            var telefoneLimpo = new string(telefone.Where(char.IsDigit).ToArray());
            var cliente = await _context.Clientes.Find(c => c.EmpresaId == empresa.Id && c.Telefone == telefoneLimpo).FirstOrDefaultAsync();
            if (cliente == null) return NotFound();
            return Ok(new { id = cliente.Id, nome = cliente.Nome, telefone = cliente.Telefone, email = cliente.Email });
        }

        [HttpPatch("{slug}/agendamentos/{id}/cancelar")]
        public async Task<IActionResult> CancelarAgendamentoCliente(string slug, string id, [FromQuery] string telefone)
        {
            var empresa = await _context.Empresas.Find(e => e.Slug == slug).FirstOrDefaultAsync();
            if (empresa == null) return NotFound();
            var telefoneLimpo = new string(telefone.Where(char.IsDigit).ToArray());
            var cliente = await _context.Clientes.Find(c => c.EmpresaId == empresa.Id && c.Telefone == telefoneLimpo).FirstOrDefaultAsync();
            if (cliente == null) return Unauthorized();

            var agendamento = await _context.Agendamentos.Find(a => a.Id == id && a.EmpresaId == empresa.Id && a.ClienteId == cliente.Id).FirstOrDefaultAsync();
            if (agendamento == null) return NotFound();
            if (agendamento.Status == "cancelado") return BadRequest();

            agendamento.Status = "cancelado";
            agendamento.AlteradoEm = DateTime.UtcNow;
            await _context.Agendamentos.ReplaceOneAsync(a => a.Id == id, agendamento);

            return Ok(new { mensagem = "Agendamento cancelado." });
        }
    }

    public class AgendamentoPublicoDto
    {
        [System.ComponentModel.DataAnnotations.Required]
        public string Nome { get; set; } = "";
        [System.ComponentModel.DataAnnotations.Required]
        public string Telefone { get; set; } = "";
        [System.ComponentModel.DataAnnotations.Required]
        public string ServicoId { get; set; } = "";
        [System.ComponentModel.DataAnnotations.Required]
        public string? ProfissionalId { get; set; }
        [System.ComponentModel.DataAnnotations.Required]
        public DateTime DataHoraInicio { get; set; }
        public int FusoMinutos { get; set; }
    }

    public class ClientePublicoDto
    {
        public string Nome { get; set; } = "";
        public string Telefone { get; set; } = "";
        public string? Email { get; set; }
    }
}