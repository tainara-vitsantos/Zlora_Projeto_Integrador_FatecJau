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

            // AQUI ESTÁ A CORREÇÃO: Ignorar o campo JornadaTrabalho para não quebrar 
            // caso existam dados antigos no banco.
            var profissionais = await _context.Profissionais
                .Find(p => p.EmpresaId == EmpresaId)
                .Project<Profissional>(Builders<Profissional>.Projection.Exclude(p => p.JornadaTrabalho))
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

        // ==========================================
        // NOVAS ROTAS DE HORÁRIOS
        // ==========================================

        [HttpGet("{id}/horarios")]
        public async Task<IActionResult> GetHorarios(string id)
        {
            if (!ObjectId.TryParse(id, out _) || string.IsNullOrWhiteSpace(EmpresaId))
                return NotFound();

            var profissional = await _context.Profissionais
                .Find(p => p.Id == id && p.EmpresaId == EmpresaId)
                .FirstOrDefaultAsync();

            if (profissional == null)
                return NotFound(new { mensagem = "Profissional não encontrado." });

            // Retorna a JornadaTrabalho ou um dicionário vazio
            return Ok(profissional.JornadaTrabalho ?? new Dictionary<string, HorarioDia>());
        }

        [HttpPut("{id}/horarios")]
        public async Task<IActionResult> UpdateHorarios(string id, [FromBody] Dictionary<string, HorarioDia> jornada)
        {
            if (!ObjectId.TryParse(id, out _) || string.IsNullOrWhiteSpace(EmpresaId))
                return NotFound();

            var atualizacao = await _context.Profissionais.UpdateOneAsync(
                p => p.Id == id && p.EmpresaId == EmpresaId,
                Builders<Profissional>.Update
                    .Set(p => p.JornadaTrabalho, jornada) // SALVA NA NOVA PROPRIEDADE
                    .Set(p => p.AlteradoEm, DateTime.UtcNow)
            );

            if (atualizacao.MatchedCount == 0)
                return NotFound(new { mensagem = "Profissional não encontrado." });

            return NoContent();
        }

        // ==========================================
        // CRIAÇÃO DE ACESSO
        // ==========================================
        public class CriarAcessoDto
        {
            public string Email { get; set; } = "";
            public string Senha { get; set; } = "";
        }

        [HttpPost("{id}/acesso")]
        public async Task<IActionResult> CriarAcesso(string id, [FromBody] CriarAcessoDto dados)
        {
            if (!ObjectId.TryParse(id, out _) || string.IsNullOrWhiteSpace(EmpresaId))
                return NotFound();

            var email = dados.Email.Trim().ToLowerInvariant();

            if (string.IsNullOrWhiteSpace(email) || dados.Senha.Length < 8)
                return BadRequest(new { mensagem = "Informe um e-mail e uma senha com pelo menos 8 caracteres." });

            var profissional = await _context.Profissionais
                .Find(p => p.Id == id && p.EmpresaId == EmpresaId)
                .FirstOrDefaultAsync();

            if (profissional == null)
                return NotFound(new { mensagem = "Profissional não encontrado." });

            if (!string.IsNullOrWhiteSpace(profissional.UsuarioId))
                return Conflict(new { mensagem = "Esse profissional já possui acesso." });

            var emailExiste = await _context.Usuarios.Find(u => u.Email == email).AnyAsync();

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

            usuario.SenhaHash = _passwordHasher.HashPassword(usuario, dados.Senha);

            var membro = new MembroEmpresa
            {
                Id = ObjectId.GenerateNewId().ToString(),
                EmpresaId = EmpresaId,
                UsuarioId = usuario.Id!,
                Papel = "profissional",
                Permissoes = new List<string> { "agenda.visualizar" },
                Status = "ativo",
                CriadoEm = DateTime.UtcNow
            };

            try
            {
                await _context.Usuarios.InsertOneAsync(usuario);
                await _context.MembrosEmpresa.InsertOneAsync(membro);

                profissional.UsuarioId = usuario.Id;
                profissional.AlteradoEm = DateTime.UtcNow;

                var atualizacao = await _context.Profissionais.UpdateOneAsync(
                    p => p.Id == id && p.EmpresaId == EmpresaId && p.UsuarioId == null,
                    Builders<Profissional>.Update
                        .Set(p => p.UsuarioId, usuario.Id)
                        .Set(p => p.AlteradoEm, DateTime.UtcNow)
                );

                if (atualizacao.MatchedCount != 1)
                    throw new InvalidOperationException("Não foi possível vincular a conta ao profissional.");
            }
            catch
            {
                await _context.MembrosEmpresa.DeleteOneAsync(m => m.Id == membro.Id);
                await _context.Usuarios.DeleteOneAsync(u => u.Id == usuario.Id);
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