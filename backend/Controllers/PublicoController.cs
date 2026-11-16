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

        // ==========================================
        // 1. BUSCAR DADOS DO SALÃO
        // ==========================================
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
                profissionais
            });
        }

        // ==========================================
        // 2. AGENDAMENTO PÚBLICO
        // ==========================================
        [HttpPost("{slug}/agendar")]
        public async Task<IActionResult> AgendarPublico(string slug, [FromBody] AgendamentoPublicoDto dados)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            var empresa = await _context.Empresas.Find(e => e.Slug == slug && e.Status == "ativa").FirstOrDefaultAsync();
            if (empresa == null) return NotFound(new { mensagem = "Estabelecimento não encontrado." });

            var servico = await _context.Servicos.Find(s => s.Id == dados.ServicoId && s.EmpresaId == empresa.Id).FirstOrDefaultAsync();
            if (servico == null) return BadRequest(new { mensagem = "Serviço não encontrado." });

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

            var dataInicio = dados.DataHoraInicio;
            var dataFim = dataInicio.AddMinutes(servico.DuracaoMinutos);

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

        // ==========================================
        // 3. CADASTRO DE CLIENTE NO LINK PÚBLICO
        // ==========================================
        [HttpPost("{slug}/cadastrar-cliente")]
        public async Task<IActionResult> CadastrarClientePublico(string slug, [FromBody] ClientePublicoDto dados)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            var empresa = await _context.Empresas.Find(e => e.Slug == slug).FirstOrDefaultAsync();
            if (empresa == null) return NotFound(new { mensagem = "Salão não encontrado." });

            var telefoneLimpo = new string(dados.Telefone.Where(char.IsDigit).ToArray());
            
            // Verifica se já existe um cliente com esse telefone neste salão
            var existe = await _context.Clientes.Find(c => c.EmpresaId == empresa.Id && c.Telefone == telefoneLimpo).AnyAsync();
            if (existe) return Conflict(new { mensagem = "Este WhatsApp já está cadastrado. Faça login." });

            var novoCliente = new Cliente
            {
                Id = ObjectId.GenerateNewId().ToString(),
                EmpresaId = empresa.Id!,
                Nome = dados.Nome.Trim(),
                Email = dados.Email?.Trim().ToLowerInvariant(),
                Telefone = telefoneLimpo,
                Status = "ativo",
                CriadoEm = DateTime.UtcNow,
                AlteradoEm = DateTime.UtcNow
            };

            await _context.Clientes.InsertOneAsync(novoCliente);

            return Ok(new { mensagem = "Cadastro realizado com sucesso!" });
        }

        // ==========================================
        // 4. PORTAL DO CLIENTE (BUSCAR AGENDAMENTOS E PERFIL)
        // ==========================================
        [HttpGet("{slug}/meus-agendamentos")]
        public async Task<IActionResult> GetMeusAgendamentos(string slug, [FromQuery] string telefone)
        {
            if (string.IsNullOrWhiteSpace(telefone)) return BadRequest(new { mensagem = "Informe o telefone." });

            var empresa = await _context.Empresas.Find(e => e.Slug == slug).FirstOrDefaultAsync();
            if (empresa == null) return NotFound(new { mensagem = "Salão não encontrado." });

            var telefoneLimpo = new string(telefone.Where(char.IsDigit).ToArray());
            var cliente = await _context.Clientes.Find(c => c.EmpresaId == empresa.Id && c.Telefone == telefoneLimpo).FirstOrDefaultAsync();
            
            if (cliente == null) return Ok(new List<object>());

            var agendamentos = await _context.Agendamentos
                .Find(a => a.EmpresaId == empresa.Id && a.ClienteId == cliente.Id)
                .SortByDescending(a => a.DataHoraInicio)
                .ToListAsync();

            var resultado = new List<object>();
            foreach (var ag in agendamentos)
            {
                var servico = await _context.Servicos.Find(s => s.Id == ag.ServicoId).FirstOrDefaultAsync();
                var profissional = await _context.Profissionais.Find(p => p.Id == ag.ProfissionalId).FirstOrDefaultAsync();

                resultado.Add(new
                {
                    id = ag.Id,
                    dataHoraInicio = ag.DataHoraInicio,
                    status = ag.Status,
                    servicoNome = servico?.Nome ?? "Serviço Excluído",
                    profissionalNome = profissional?.Nome ?? "Profissional Excluído"
                });
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

            if (cliente == null) return NotFound(new { mensagem = "Cliente não encontrado." });

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

            if (agendamento.Status == "cancelado") return BadRequest(new { mensagem = "Agendamento já cancelado." });

            agendamento.Status = "cancelado";
            agendamento.AlteradoEm = DateTime.UtcNow;
            await _context.Agendamentos.ReplaceOneAsync(a => a.Id == id, agendamento);

            return Ok(new { mensagem = "Agendamento cancelado com sucesso." });
        }
    }

    // ==========================================
    // DTOs (Data Transfer Objects)
    // ==========================================
    public class AgendamentoPublicoDto
    {
        public string Nome { get; set; } = "";
        public string Telefone { get; set; } = "";
        public string ServicoId { get; set; } = "";
        public string? ProfissionalId { get; set; }
        public DateTime DataHoraInicio { get; set; }
    }

    public class ClientePublicoDto
    {
        public string Nome { get; set; } = "";
        public string Telefone { get; set; } = "";
        public string? Email { get; set; }
    }
}