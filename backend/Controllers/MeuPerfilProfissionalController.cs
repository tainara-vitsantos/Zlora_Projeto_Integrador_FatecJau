using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.Security.Claims;
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

        // ==========================================
        // GET E PUT DO PERFIL (Já existiam)
        // ==========================================
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            if (string.IsNullOrWhiteSpace(UsuarioId) || string.IsNullOrWhiteSpace(EmpresaId))
                return Forbid();

            var profissional = await _context.Profissionais
                .Find(p => p.UsuarioId == UsuarioId && p.EmpresaId == EmpresaId)
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

        // ==========================================
        // HORÁRIOS DE ATENDIMENTO (NOVO)
        // ==========================================
        [HttpGet("horarios")]
        public async Task<IActionResult> GetHorarios()
        {
            if (string.IsNullOrWhiteSpace(UsuarioId) || string.IsNullOrWhiteSpace(EmpresaId))
                return Forbid();

            var profissional = await _context.Profissionais
                .Find(p => p.UsuarioId == UsuarioId && p.EmpresaId == EmpresaId)
                .FirstOrDefaultAsync();

            if (profissional == null)
                return NotFound(new { mensagem = "Perfil profissional não encontrado." });

            // Se o profissional ainda não configurou nada, retorna um padrão de Seg-Sex
            if (profissional.JornadaTrabalho == null || profissional.JornadaTrabalho.Count == 0)
            {
                var padrao = new Dictionary<string, HorarioDia>();
                var dias = new[] { "segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo" };
                
                foreach (var dia in dias)
                {
                    bool ehFimDeSemana = dia == "sabado" || dia == "domingo";
                    padrao[dia] = new HorarioDia 
                    { 
                        Ativo = !ehFimDeSemana, 
                        Inicio = "09:00", 
                        Fim = "18:00" 
                    };
                }
                return Ok(padrao);
            }

            return Ok(profissional.JornadaTrabalho);
        }

        [HttpPut("horarios")]
        public async Task<IActionResult> UpdateHorarios([FromBody] Dictionary<string, HorarioDia> horarios)
        {
            if (string.IsNullOrWhiteSpace(UsuarioId) || string.IsNullOrWhiteSpace(EmpresaId))
                return Forbid();

            var profissional = await _context.Profissionais
                .Find(p => p.UsuarioId == UsuarioId && p.EmpresaId == EmpresaId)
                .FirstOrDefaultAsync();

            if (profissional == null)
                return NotFound(new { mensagem = "Perfil profissional não encontrado." });

            // Atualiza apenas o campo JornadaTrabalho
            await _context.Profissionais.UpdateOneAsync(
                p => p.Id == profissional.Id,
                Builders<Profissional>.Update
                    .Set(p => p.JornadaTrabalho, horarios)
                    .Set(p => p.AlteradoEm, DateTime.UtcNow)
            );

            return Ok(new { mensagem = "Horários de atendimento atualizados com sucesso!" });
        }
    }

    // DTO que estava no final do arquivo
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