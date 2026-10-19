using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Bson;
using MongoDB.Driver;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Zlora.Data;
using Zlora.Models;

namespace Zlora.Controllers
{
    // Eu concentro aqui as operações públicas de cadastro e login.
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly ContextMongoDb _context;
        private readonly IPasswordHasher<Usuario> _passwordHasher;
        private readonly IConfiguration _configuration;

        public AuthController(ContextMongoDb context, IPasswordHasher<Usuario> passwordHasher, IConfiguration configuration)
        {
            _context = context;
            _passwordHasher = passwordHasher;
            _configuration = configuration;
        }

        // Eu recebo os mesmos campos que o formulário React envia ao criar uma conta de negócio.
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] CadastroUsuario dados)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
          

            // Eu padronizo o e-mail para evitar que maiúsculas e espaços gerem contas aparentemente diferentes.
            var email = dados.Email.Trim().ToLowerInvariant();
            if (await _context.Usuarios.Find(u => u.Email == email).AnyAsync())
                return Conflict(new { mensagem = "Este e-mail já está cadastrado." });

            var usuario = new Usuario
            {
                Id = ObjectId.GenerateNewId().ToString(),
                Nome = dados.NomeContato.Trim(),
                Email = email,
                Telefone = new string(dados.Telefone.Where(char.IsDigit).ToArray()),
                Status = "ativo",
                CriadoEm = DateTime.UtcNow,
                AlteradoEm = DateTime.UtcNow
            };
            // Eu transformo a senha em hash antes de persistir o usuário; a senha recebida não é salva.
            usuario.SenhaHash = _passwordHasher.HashPassword(usuario, dados.Senha);

            // Eu crio a empresa que será administrada pela pessoa que acabou de se cadastrar.
            var empresa = new Empresa
            {
                Id = ObjectId.GenerateNewId().ToString(),
                NomeFantasia = dados.Nome.Trim(),
                ProprietarioUsuarioId = usuario.Id,
                Status = "ativa",
                CriadoEm = DateTime.UtcNow,
                AlteradoEm = DateTime.UtcNow
            };

            // Eu crio o vínculo entre usuário e empresa para definir seu papel e permissões iniciais.
            var membro = new MembroEmpresa
            {
                Id = ObjectId.GenerateNewId().ToString(),
                EmpresaId = empresa.Id!,
                UsuarioId = usuario.Id!,
                Papel = "administrador",
                Permissoes = new List<string> { "clientes.visualizar", "clientes.cadastrar", "clientes.editar", "agenda.visualizar", "agenda.criar", "agenda.editar", "servicos.visualizar", "servicos.editar" },
                Status = "ativo",
                CriadoEm = DateTime.UtcNow
            };

            try
            {
                // Eu salvo os três documentos relacionados. Se uma etapa falhar, tento desfazer as anteriores.
                await _context.Usuarios.InsertOneAsync(usuario);
                await _context.Empresas.InsertOneAsync(empresa);
                await _context.MembrosEmpresa.InsertOneAsync(membro);
            }
            catch (MongoWriteException ex) when (ex.WriteError?.Category == ServerErrorCategory.DuplicateKey)
            {
                await _context.Usuarios.DeleteOneAsync(u => u.Id == usuario.Id);
                return Conflict(new { mensagem = "Este e-mail já está cadastrado." });
            }
            catch
            {
                // Eu faço uma compensação manual porque estas três gravações não estão dentro de uma transação MongoDB.
                await _context.MembrosEmpresa.DeleteOneAsync(m => m.Id == membro.Id);
                await _context.Empresas.DeleteOneAsync(e => e.Id == empresa.Id);
                await _context.Usuarios.DeleteOneAsync(u => u.Id == usuario.Id);
                throw;
            }

            // Eu devolvo o mesmo formato esperado pelo contexto de autenticação do React.
            return Ok(CriarResposta(usuario, empresa, membro.Papel));
        }

        // Eu recebo e-mail e senha, verifico o hash e só então emito um token para a sessão.
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginUsuario dados)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            var email = dados.Email.Trim().ToLowerInvariant();
            var usuario = await _context.Usuarios.Find(u => u.Email == email && u.Status == "ativo").FirstOrDefaultAsync();
            if (usuario == null) return Unauthorized(new { mensagem = "E-mail ou senha inválidos." });

            var verificacao = _passwordHasher.VerifyHashedPassword(usuario, usuario.SenhaHash, dados.Senha);
            if (verificacao == PasswordVerificationResult.Failed)
                return Unauthorized(new { mensagem = "E-mail ou senha inválidos." });

            // Eu exijo um vínculo ativo com uma empresa para que o token tenha um contexto de acesso.
            var membro = await _context.MembrosEmpresa.Find(m => m.UsuarioId == usuario.Id && m.Status == "ativo").FirstOrDefaultAsync();
            if (membro == null) return Unauthorized(new { mensagem = "A conta não está vinculada a uma empresa ativa." });
            var empresa = await _context.Empresas.Find(e => e.Id == membro.EmpresaId && e.Status == "ativa").FirstOrDefaultAsync();
            if (empresa == null) return Unauthorized(new { mensagem = "A empresa vinculada à conta não está ativa." });

            return Ok(CriarResposta(usuario, empresa, membro.Papel));
        }

        // Eu gero o JWT com o ID do usuário e da empresa para os Controllers filtrarem os dados corretamente.
        // Eu nunca incluo a senha nem o hash da senha nas informações devolvidas ao navegador.
        private object CriarResposta(Usuario usuario, Empresa empresa, string papel)
        {
            var jwt = _configuration.GetSection("Jwt");
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, usuario.Id!),
                new(ClaimTypes.Name, usuario.Nome),
                new(ClaimTypes.Email, usuario.Email),
                new("empresa_id", empresa.Id!),
                new(ClaimTypes.Role, papel)
            };
            var chave = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["SecretKey"]!));
            var credenciais = new SigningCredentials(chave, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(jwt["Issuer"], jwt["Audience"], claims,
                expires: DateTime.UtcNow.AddHours(4), signingCredentials: credenciais);
            return new
            {
                token = new JwtSecurityTokenHandler().WriteToken(token),
                usuario = new { id = usuario.Id, nome = usuario.Nome, estabelecimento = empresa.NomeFantasia, email = usuario.Email, empresaId = empresa.Id, papel }
            };
        }
    }
}
