using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Security.Claims;
using System.Globalization;
using Zlora.Data;
using Zlora.Models;

namespace Zlora.Controllers
{
    [ApiController]
    [Authorize(Roles = "profissional")]
    [Route("api/profissional/perfil")]
    public class MeuPerfilProfissionalController : ControllerBase
    {
        private readonly ContextMongoDb _context;

        public MeuPerfilProfissionalController(ContextMongoDb context)
        {
            _context = context;
        }

        private string? UsuarioId => User.FindFirstValue(ClaimTypes.NameIdentifier);
        private string? EmpresaId => User.FindFirstValue("empresa_id");

        private Task RegistrarAlteracao(string profissionalId, string profissionalNome, string tipo, string descricao) =>
            _context.AlteracoesAgenda.InsertOneAsync(new AlteracaoAgenda
            {
                Id = ObjectId.GenerateNewId().ToString(),
                EmpresaId = EmpresaId!,
                ProfissionalId = profissionalId,
                ProfissionalNome = profissionalNome,
                Tipo = tipo,
                Descricao = descricao,
                CriadoEm = DateTime.UtcNow
            });

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            if (string.IsNullOrWhiteSpace(UsuarioId) || string.IsNullOrWhiteSpace(EmpresaId))
                return Forbid();

            var profissional = await _context.Profissionais
                .Find(p => p.UsuarioId == UsuarioId && p.EmpresaId == EmpresaId)
                .Project<Profissional>(Builders<Profissional>.Projection.Exclude(p => p.JornadaTrabalho))
                .FirstOrDefaultAsync();

            if (profissional == null)
                return NotFound(new { mensagem = "Perfil profissional não encontrado." });

            var usuario = await _context.Usuarios.Find(u => u.Id == UsuarioId).FirstOrDefaultAsync();

            return Ok(new
            {
                id = profissional.Id,
                nome = profissional.Nome,
                email = usuario?.Email,
                telefone = profissional.Telefone,
                especialidade = profissional.Especialidade
            });
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] AtualizarPerfilDto dados)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            if (string.IsNullOrWhiteSpace(UsuarioId) || string.IsNullOrWhiteSpace(EmpresaId)) return Forbid();

            var profissional = await _context.Profissionais
                .Find(p => p.UsuarioId == UsuarioId && p.EmpresaId == EmpresaId)
                .Project<Profissional>(Builders<Profissional>.Projection.Exclude(p => p.JornadaTrabalho))
                .FirstOrDefaultAsync();

            if (profissional == null) return NotFound(new { mensagem = "Perfil profissional não encontrado." });

            var usuario = await _context.Usuarios.Find(u => u.Id == UsuarioId).FirstOrDefaultAsync();
            if (usuario == null) return NotFound(new { mensagem = "Conta de usuário não encontrada." });

            var nome = dados.Nome.Trim();
            var telefone = dados.Telefone.Trim();
            var especialidade = dados.Especialidade.Trim();

            await _context.Profissionais.UpdateOneAsync(
                p => p.Id == profissional.Id && p.UsuarioId == UsuarioId && p.EmpresaId == EmpresaId,
                Builders<Profissional>.Update
                    .Set(p => p.Nome, nome)
                    .Set(p => p.Telefone, telefone)
                    .Set(p => p.Especialidade, especialidade)
                    .Set(p => p.AlteradoEm, DateTime.UtcNow)
            );

            await _context.Usuarios.UpdateOneAsync(
                u => u.Id == UsuarioId,
                Builders<Usuario>.Update
                    .Set(u => u.Nome, nome)
                    .Set(u => u.Telefone, telefone)
                    .Set(u => u.AlteradoEm, DateTime.UtcNow)
            );

            return Ok(new { mensagem = "Perfil atualizado com sucesso!", nome, telefone, especialidade });
        }

        [HttpGet("horarios")]
        public async Task<IActionResult> GetHorarios()
        {
            if (string.IsNullOrWhiteSpace(UsuarioId) || string.IsNullOrWhiteSpace(EmpresaId))
                return Forbid();

            // Busca bruta para evitar erro 500 com dados antigos
            var profissionalDoc = await _context.Profissionais
                .Find(p => p.UsuarioId == UsuarioId && p.EmpresaId == EmpresaId)
                .Project<BsonDocument>(Builders<Profissional>.Projection.Include("jornada_trabalho"))
                .FirstOrDefaultAsync();

            if (profissionalDoc == null)
                return NotFound(new { mensagem = "Perfil profissional não encontrado." });

            if (!profissionalDoc.Contains("jornada_trabalho") || profissionalDoc["jornada_trabalho"] == BsonNull.Value)
            {
                var padrao = new Dictionary<string, HorarioDia>();
                var dias = new[] { "segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo" };
                
                foreach (var dia in dias)
                {
                    bool ehFimDeSemana = dia == "sabado" || dia == "domingo";
                    padrao[dia] = new HorarioDia 
                    { 
                        Ativo = !ehFimDeSemana, 
                        Turnos = new List<Turno> { new Turno { Inicio = "09:00", Fim = "18:00" } }
                    };
                }
                return Ok(padrao);
            }

            return Content(profissionalDoc["jornada_trabalho"].ToJson(), "application/json");
        }

        [HttpPut("horarios")]
        public async Task<IActionResult> UpdateHorarios([FromBody] Dictionary<string, HorarioDia>? horarios)
        {
            if (string.IsNullOrWhiteSpace(UsuarioId) || string.IsNullOrWhiteSpace(EmpresaId))
                return Forbid();
            if (horarios == null)
                return BadRequest(new { mensagem = "Informe os horários de atendimento." });

            var profissional = await _context.Profissionais
                .Find(p => p.UsuarioId == UsuarioId && p.EmpresaId == EmpresaId)
                .Project<Profissional>(Builders<Profissional>.Projection.Exclude(p => p.JornadaTrabalho))
                .FirstOrDefaultAsync();

            if (profissional == null)
                return NotFound(new { mensagem = "Perfil profissional não encontrado." });

            var diasValidos = new HashSet<string>(
                new[] { "segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo" },
                StringComparer.OrdinalIgnoreCase);
            foreach (var (dia, config) in horarios)
            {
                if (!diasValidos.Contains(dia) || config == null || config.Turnos == null)
                    return BadRequest(new { mensagem = "A jornada contém um dia ou turno inválido." });

                var intervalos = new List<(int Inicio, int Fim)>();
                foreach (var turno in config.Turnos)
                {
                    if (!TimeSpan.TryParseExact(turno.Inicio, @"hh\:mm", CultureInfo.InvariantCulture, out var inicio) ||
                        !TimeSpan.TryParseExact(turno.Fim, @"hh\:mm", CultureInfo.InvariantCulture, out var fim) ||
                        inicio >= fim || inicio.TotalMinutes < 0 || fim.TotalMinutes >= 24 * 60)
                        return BadRequest(new { mensagem = $"Informe horários válidos para {dia}." });

                    intervalos.Add(((int)inicio.TotalMinutes, (int)fim.TotalMinutes));
                }

                intervalos.Sort((a, b) => a.Inicio.CompareTo(b.Inicio));
                for (var i = 1; i < intervalos.Count; i++)
                {
                    if (intervalos[i].Inicio < intervalos[i - 1].Fim)
                        return BadRequest(new { mensagem = $"Os turnos de {dia} não podem se sobrepor." });
                }
            }

            var atualizacao = await _context.Profissionais.UpdateOneAsync(
                p => p.Id == profissional.Id,
                Builders<Profissional>.Update
                    .Set(p => p.JornadaTrabalho, horarios)
                    .Set(p => p.AlteradoEm, DateTime.UtcNow)
            );
            if (atualizacao.MatchedCount == 0)
                return NotFound(new { mensagem = "Perfil profissional não encontrado." });

            await RegistrarAlteracao(
                profissional.Id!,
                profissional.Nome,
                "jornada_atualizada",
                "Jornada semanal atualizada.");

            return Ok(new { mensagem = "Horários de atendimento atualizados com sucesso!" });
        }

        [HttpGet("bloqueios")]
        public async Task<IActionResult> GetBloqueios()
        {
            if (string.IsNullOrWhiteSpace(UsuarioId) || string.IsNullOrWhiteSpace(EmpresaId))
                return Forbid();

            var profissional = await _context.Profissionais
                .Find(p => p.UsuarioId == UsuarioId && p.EmpresaId == EmpresaId)
                .Project<Profissional>(Builders<Profissional>.Projection
                    .Include(p => p.Id)
                    .Include(p => p.Nome)
                    .Include(p => p.BloqueiosAgenda)
                )
                .FirstOrDefaultAsync();

            return profissional == null
                ? NotFound(new { mensagem = "Perfil profissional não encontrado." })
                : Ok(profissional.BloqueiosAgenda);
        }

        [HttpPost("bloqueios")]
        public async Task<IActionResult> CriarBloqueio([FromBody] CriarBloqueioDto dados)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            if (string.IsNullOrWhiteSpace(UsuarioId) || string.IsNullOrWhiteSpace(EmpresaId))
                return Forbid();
            if (!DateOnly.TryParseExact(dados.Data, "yyyy-MM-dd", CultureInfo.InvariantCulture,
                    DateTimeStyles.None, out _) ||
                (string.IsNullOrWhiteSpace(dados.Inicio) != string.IsNullOrWhiteSpace(dados.Fim)))
                return BadRequest(new { mensagem = "Informe uma data válida e, para bloqueio parcial, início e fim." });

            if (!string.IsNullOrWhiteSpace(dados.Inicio) &&
                (!TimeSpan.TryParseExact(dados.Inicio, @"hh\:mm", CultureInfo.InvariantCulture, out var inicio) ||
                 !TimeSpan.TryParseExact(dados.Fim, @"hh\:mm", CultureInfo.InvariantCulture, out var fim) ||
                 inicio >= fim || fim.TotalMinutes >= 24 * 60))
                return BadRequest(new { mensagem = "O intervalo do bloqueio é inválido." });

            var bloqueio = new BloqueioAgenda
            {
                Id = ObjectId.GenerateNewId().ToString(),
                Data = dados.Data,
                Inicio = dados.Inicio,
                Fim = dados.Fim,
                Motivo = dados.Motivo.Trim()
            };

            var profissional = await _context.Profissionais
                .Find(p => p.UsuarioId == UsuarioId && p.EmpresaId == EmpresaId)
                .Project<Profissional>(Builders<Profissional>.Projection
                    .Include(p => p.Id)
                    .Include(p => p.Nome)
                )
                .FirstOrDefaultAsync();
            if (profissional == null)
                return NotFound(new { mensagem = "Perfil profissional não encontrado." });

            var atualizacao = await _context.Profissionais.UpdateOneAsync(
                p => p.Id == profissional.Id && p.EmpresaId == EmpresaId,
                Builders<Profissional>.Update
                    .Push(p => p.BloqueiosAgenda, bloqueio)
                    .Set(p => p.AlteradoEm, DateTime.UtcNow));

            if (atualizacao.MatchedCount == 0)
                return NotFound(new { mensagem = "Perfil profissional não encontrado." });

            await RegistrarAlteracao(
                profissional.Id!,
                profissional.Nome,
                "bloqueio_criado",
                bloqueio.Inicio == null
                    ? $"Folga adicionada em {bloqueio.Data}."
                    : $"Bloqueio adicionado em {bloqueio.Data}, das {bloqueio.Inicio} às {bloqueio.Fim}.");

            return Ok(bloqueio);
        }

        [HttpDelete("bloqueios/{id}")]
        public async Task<IActionResult> ExcluirBloqueio(string id)
        {
            if (string.IsNullOrWhiteSpace(UsuarioId) || string.IsNullOrWhiteSpace(EmpresaId))
                return Forbid();

            var profissional = await _context.Profissionais
                .Find(p => p.UsuarioId == UsuarioId && p.EmpresaId == EmpresaId)
                .Project<Profissional>(Builders<Profissional>.Projection
                    .Include(p => p.Id)
                    .Include(p => p.Nome)
                    .Include(p => p.BloqueiosAgenda)
                )
                .FirstOrDefaultAsync();
            if (profissional == null) return NotFound();

            var bloqueio = profissional.BloqueiosAgenda.FirstOrDefault(item => item.Id == id);
            if (bloqueio == null) return NotFound();

            var atualizacao = await _context.Profissionais.UpdateOneAsync(
                p => p.UsuarioId == UsuarioId && p.EmpresaId == EmpresaId,
                Builders<Profissional>.Update
                    .PullFilter(p => p.BloqueiosAgenda, bloqueio => bloqueio.Id == id)
                    .Set(p => p.AlteradoEm, DateTime.UtcNow));

            if (atualizacao.ModifiedCount == 0) return NotFound();
            await RegistrarAlteracao(
                profissional.Id!,
                profissional.Nome,
                "bloqueio_removido",
                $"Bloqueio removido em {bloqueio.Data}.");
            return NoContent();
        }
    }

    public class CriarBloqueioDto
    {
        [System.ComponentModel.DataAnnotations.Required]
        public string Data { get; set; } = "";
        public string? Inicio { get; set; }
        public string? Fim { get; set; }
        [System.ComponentModel.DataAnnotations.StringLength(160)]
        public string Motivo { get; set; } = "";
    }

    public class AtualizarPerfilDto
    {
        [System.ComponentModel.DataAnnotations.Required]
        [System.ComponentModel.DataAnnotations.StringLength(120)]
        public string Nome { get; set; } = "";
        public string Telefone { get; set; } = "";
        [System.ComponentModel.DataAnnotations.StringLength(120)]
        public string Especialidade { get; set; } = "";
    }
}