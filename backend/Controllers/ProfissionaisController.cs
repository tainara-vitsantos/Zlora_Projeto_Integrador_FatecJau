
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Security.Claims;
using Zlora.Data;
using Zlora.Models;

namespace Zlora.Controllers
{
    // Aqui só o administrador pode gerenciar os profissionais da empresa.
    // Mas calma que vai ter uma rota pra cada profissional ver e editar o próprio perfil.
    [Authorize(Roles = "administrador")]
    [Route("api/profissionais")]
    public class ProfissionaisController : ControllerBase
    {
        private readonly ContextMongoDb _context;
        private readonly IPasswordHasher<Usuario> _passwordHasher;

        public ProfissionaisController(
            ContextMongoDb context,
            IPasswordHasher<Usuario> passwordHasher)
        {
            _context = context;
            _passwordHasher = passwordHasher;
        }

        private string? EmpresaId => User.FindFirstValue("empresa_id");

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            if (string.IsNullOrWhiteSpace(EmpresaId)) return Forbid();

            var profissionais = await _context.Profissionais
                .Find(p => p.EmpresaId == EmpresaId)
                .SortBy(p => p.Nome).ToListAsync();

            return Ok(profissionais);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Profissional profissional)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            if (string.IsNullOrWhiteSpace(EmpresaId)) return Forbid();

            profissional.Id = ObjectId.GenerateNewId().ToString();
            profissional.EmpresaId = EmpresaId;
            profissional.CriadoEm = DateTime.UtcNow;
            profissional.AlteradoEm = DateTime.UtcNow;

            await _context.Profissionais.InsertOneAsync(profissional);
            return CreatedAtAction(nameof(Get), new { id = profissional.Id }, profissional);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] Profissional dados)
        {
            if (!ObjectId.TryParse(id, out _) || string.IsNullOrWhiteSpace(EmpresaId)) return NotFound();

            var existente = await _context.Profissionais.Find(p => p.Id == id && p.EmpresaId == EmpresaId).FirstOrDefaultAsync();
            if (existente == null) return NotFound();

            existente.Nome = dados.Nome.Trim();
            existente.Especialidade = dados.Especialidade;
            existente.Telefone = dados.Telefone;
            existente.ComissaoPorcentagem = dados.ComissaoPorcentagem;
            existente.Status = dados.Status;
            existente.AlteradoEm = DateTime.UtcNow;

            await _context.Profissionais.ReplaceOneAsync(p => p.Id == id && p.EmpresaId == EmpresaId, existente);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            if (!ObjectId.TryParse(id, out _) || string.IsNullOrWhiteSpace(EmpresaId)) return NotFound();

            var resultado = await _context.Profissionais.DeleteOneAsync(p => p.Id == id && p.EmpresaId == EmpresaId);
            return resultado.DeletedCount == 0 ? NotFound() : NoContent();
        }

        // Dados que o administrador informa para liberar o login do profissional.
        public class CriarAcessoDto
        {
            public string Email { get; set; } = "";
            public string Senha { get; set; } = "";
        }

        // Aqui eu crio a conta e faço o vínculo com a empresa e o profissional.
        [HttpPost("{id}/acesso")]
        public async Task<IActionResult> CriarAcesso(
            string id, [FromBody] CriarAcessoDto dados)
        {
            if (!ObjectId.TryParse(id, out _) ||
                string.IsNullOrWhiteSpace(EmpresaId))
                return NotFound();

            var email = dados.Email.Trim().ToLowerInvariant();

            if (string.IsNullOrWhiteSpace(email) ||
                dados.Senha.Length < 8)
            {
                return BadRequest(new
                {
                    mensagem = "Informe um e-mail e uma senha com pelo menos 8 caracteres."
                });
            }

            // Confiro se esse profissional pertence ao salão do administrador logado.
            var profissional = await _context.Profissionais
                .Find(p => p.Id == id && p.EmpresaId == EmpresaId)
                .FirstOrDefaultAsync();

            if (profissional == null)
                return NotFound(new { mensagem = "Profissional não encontrado." });

            if (!string.IsNullOrWhiteSpace(profissional.UsuarioId))
                return Conflict(new { mensagem = "Esse profissional já possui acesso." });

            // Não deixo criar outra conta usando um e-mail já cadastrado.
            var emailExiste = await _context.Usuarios
                .Find(u => u.Email == email)
                .AnyAsync();

            if (emailExiste)
                return Conflict(new { mensagem = "Esse e-mail já está cadastrado." });

            var usuario = new Usuario
            {
                Id = ObjectId.GenerateNewId().ToString(),
                Nome = profissional.Nome,
                Email = email,
                Telefone = profissional.Telefone,
                Status = "ativo",
                CriadoEm = DateTime.UtcNow,
                AlteradoEm = DateTime.UtcNow
            };

            // A senha fica protegida pelo mesmo mecanismo usado no login.
            usuario.SenhaHash = _passwordHasher.HashPassword(usuario, dados.Senha);

            var membro = new MembroEmpresa
            {
                Id = ObjectId.GenerateNewId().ToString(),
                EmpresaId = EmpresaId,
                UsuarioId = usuario.Id!,
                Papel = "profissional",
                Permissoes = new List<string>
                {
                    "agenda.visualizar"
                },
                Status = "ativo",
                CriadoEm = DateTime.UtcNow
            };

            // Salvo a conta, o vínculo e a ligação com o cadastro profissional.
            try
            {
                await _context.Usuarios.InsertOneAsync(usuario);
                await _context.MembrosEmpresa.InsertOneAsync(membro);

                profissional.UsuarioId = usuario.Id;
                profissional.AlteradoEm = DateTime.UtcNow;

               // Atualizo somente os campos necessários, sem substituir o cadastro inteiro.
var atualizacao = await _context.Profissionais.UpdateOneAsync(
    p => p.Id == id &&
         p.EmpresaId == EmpresaId &&
         p.UsuarioId == null,
    Builders<Profissional>.Update
        .Set(p => p.UsuarioId, usuario.Id)
        .Set(p => p.AlteradoEm, DateTime.UtcNow)
);

// Confiro se o profissional realmente foi atualizado.
if (atualizacao.MatchedCount != 1)
    throw new InvalidOperationException(
        "Não foi possível vincular a conta ao profissional.");
            }
            catch
            {
                // Se alguma etapa falhar, tento limpar os registros criados.
                await _context.MembrosEmpresa.DeleteOneAsync(
                    m => m.Id == membro.Id);

                await _context.Usuarios.DeleteOneAsync(
                    u => u.Id == usuario.Id);

                throw;
            }

            return Ok(new
            {
                mensagem = "Acesso do profissional criado com sucesso!",
                profissionalId = profissional.Id,
                papel = membro.Papel
            });
        }
    }
}
