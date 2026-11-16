
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.Security.Claims;
using Zlora.Data;
using Zlora.Models;
//O que esse controller permite: o profissional consultar e editar o próprio nome, telefone e especialidade.
//  Ele não pode trocar o e-mail, a senha, o papel nem o vínculo com a empresa por essa rota.

namespace Zlora.Controllers
{
    // Aqui o profissional só consegue acessar o próprio perfil.
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

        // Busco o cadastro profissional ligado à conta que fez login.
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            if (string.IsNullOrWhiteSpace(UsuarioId) ||
                string.IsNullOrWhiteSpace(EmpresaId))
                return Forbid();

            var profissional = await _context.Profissionais
                .Find(p => p.UsuarioId == UsuarioId &&
                           p.EmpresaId == EmpresaId)
                .FirstOrDefaultAsync();

            if (profissional == null)
                return NotFound(new { mensagem = "Perfil profissional não encontrado." });

            return Ok(new
            {
                id = profissional.Id,
                nome = profissional.Nome,
                email = (await _context.Usuarios
                    .Find(u => u.Id == UsuarioId)
                    .FirstOrDefaultAsync())?.Email,
                telefone = profissional.Telefone,
                especialidade = profissional.Especialidade
            });
        }

        // O profissional pode alterar somente os próprios dados de perfil.
        [HttpPut]
        public async Task<IActionResult> Update([FromBody] AtualizarPerfilDto dados)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            if (string.IsNullOrWhiteSpace(UsuarioId) ||
                string.IsNullOrWhiteSpace(EmpresaId))
                return Forbid();

            var profissional = await _context.Profissionais
                .Find(p => p.UsuarioId == UsuarioId &&
                           p.EmpresaId == EmpresaId)
                .FirstOrDefaultAsync();

            if (profissional == null)
                return NotFound(new { mensagem = "Perfil profissional não encontrado." });

            var usuario = await _context.Usuarios
                .Find(u => u.Id == UsuarioId)
                .FirstOrDefaultAsync();

            if (usuario == null)
                return NotFound(new { mensagem = "Conta de usuário não encontrada." });

            var nome = dados.Nome.Trim();
            var telefone = dados.Telefone.Trim();
            var especialidade = dados.Especialidade.Trim();

            // Atualizo o cadastro profissional da própria conta.
            await _context.Profissionais.UpdateOneAsync(
                p => p.Id == profissional.Id &&
                     p.UsuarioId == UsuarioId &&
                     p.EmpresaId == EmpresaId,
                Builders<Profissional>.Update
                    .Set(p => p.Nome, nome)
                    .Set(p => p.Telefone, telefone)
                    .Set(p => p.Especialidade, especialidade)
                    .Set(p => p.AlteradoEm, DateTime.UtcNow)
            );

            // Mantenho o nome e telefone da conta de login sincronizados.
            await _context.Usuarios.UpdateOneAsync(
                u => u.Id == UsuarioId,
                Builders<Usuario>.Update
                    .Set(u => u.Nome, nome)
                    .Set(u => u.Telefone, telefone)
                    .Set(u => u.AlteradoEm, DateTime.UtcNow)
            );

            return Ok(new
            {
                mensagem = "Perfil atualizado com sucesso!",
                nome,
                telefone,
                especialidade
            });
        }
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
