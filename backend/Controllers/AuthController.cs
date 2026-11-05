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

        // ==========================================
        // 1. CADASTRO DE NEGÓCIO (O que já existia)
        // ==========================================
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] CadastroUsuario dados)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
          
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
            usuario.SenhaHash = _passwordHasher.HashPassword(usuario, dados.Senha);

            var empresa = new Empresa
            {
                Id = ObjectId.GenerateNewId().ToString(),
                NomeFantasia = dados.Nome.Trim(),
                ProprietarioUsuarioId = usuario.Id,
                Status = "ativa",
                CriadoEm = DateTime.UtcNow,
                AlteradoEm = DateTime.UtcNow
            };

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
                await _context.MembrosEmpresa.DeleteOneAsync(m => m.Id == membro.Id);
                await _context.Empresas.DeleteOneAsync(e => e.Id == empresa.Id);
                await _context.Usuarios.DeleteOneAsync(u => u.Id == usuario.Id);
                throw;
            }

            return Ok(CriarResposta(usuario, empresa, membro.Papel));
        }

        // ==========================================
        // 2. CADASTRO DE CLIENTE FINAL (Novo)
        // ==========================================
        [HttpPost("register-cliente")]
        public async Task<IActionResult> RegisterCliente([FromBody] ClienteRegisterDto dados)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            // Uso do ?? string.Empty para garantir que não vai dar null reference
            var email = (dados.Email ?? string.Empty).Trim().ToLowerInvariant();
            if (await _context.Usuarios.Find(u => u.Email == email).AnyAsync())
                return Conflict(new { mensagem = "Este e-mail já está cadastrado." });

            var usuario = new Usuario
            {
                Id = ObjectId.GenerateNewId().ToString(),
                Nome = (dados.Nome ?? string.Empty).Trim(),
                Email = email,
                Telefone = new string((dados.Telefone ?? string.Empty).Where(char.IsDigit).ToArray()),
                Status = "ativo",
                CriadoEm = DateTime.UtcNow,
                AlteradoEm = DateTime.UtcNow
            };
            
            usuario.SenhaHash = _passwordHasher.HashPassword(usuario, dados.Senha ?? string.Empty);

            // Cliente final não cria Empresa, apenas o Usuário.
            await _context.Usuarios.InsertOneAsync(usuario);

            return Ok(new { mensagem = "Conta de cliente criada com sucesso. Faça login para continuar." });
        }

        // ==========================================
        // 3. LOGIN (Ajustado para Negócio e Cliente)
        // ==========================================
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

            // Procura vínculo com empresa (para saber se é dono de salão)
            var membro = await _context.MembrosEmpresa.Find(m => m.UsuarioId == usuario.Id && m.Status == "ativo").FirstOrDefaultAsync();
            
            // SE NÃO TIVER VÍNCULO COM EMPRESA, É UM CLIENTE FINAL.
            if (membro == null)
            {
                return Ok(CriarResposta(usuario, null, "cliente"));
            }

            // Se tiver, é dono de salão/funcionário.
            var empresa = await _context.Empresas.Find(e => e.Id == membro.EmpresaId && e.Status == "ativa").FirstOrDefaultAsync();
            if (empresa == null) return Unauthorized(new { mensagem = "A empresa vinculada à conta não está ativa." });

            return Ok(CriarResposta(usuario, empresa, membro.Papel));
        }

        // ==========================================
        // 4. GERADOR DE TOKEN (Ajustado para aceitar Empresa Nula)
        // ==========================================
        private object CriarResposta(Usuario usuario, Empresa? empresa, string papel)
        {
            var jwt = _configuration.GetSection("Jwt");
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, usuario.Id!),
                new(ClaimTypes.Name, usuario.Nome),
                new(ClaimTypes.Email, usuario.Email),
                new(ClaimTypes.Role, papel)
            };

            // Se o usuário for um cliente (sem empresa), não adicionamos o claim empresa_id
            if (empresa != null)
            {
                claims.Add(new Claim("empresa_id", empresa.Id!));
            }

            var chave = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["SecretKey"]!));
            var credenciais = new SigningCredentials(chave, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(jwt["Issuer"], jwt["Audience"], claims,
                expires: DateTime.UtcNow.AddHours(4), signingCredentials: credenciais);
                
            return new
            {
                token = new JwtSecurityTokenHandler().WriteToken(token),
                usuario = new 
                { 
                    id = usuario.Id, 
                    nome = usuario.Nome, 
                    estabelecimento = empresa?.NomeFantasia, // Vai ser null se for cliente
                    email = usuario.Email, 
                    empresaId = empresa?.Id, // Vai ser null se for cliente
                    papel 
                }
            };
        }
    }

    // ==========================================
    // 5. DTOs (Adicione no final do arquivo ou em uma pasta Models)
    // ==========================================
        public class ClienteRegisterDto
    {
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Telefone { get; set; } = string.Empty;
        public string Senha { get; set; } = string.Empty;
    }
}