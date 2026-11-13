using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.Security.Claims;
using Zlora.Data;
using Zlora.Models;

namespace Zlora.Controllers
{
    [ApiController]
    [Authorize] // Apenas usuários logados podem acessar
    [Route("api/empresas")]
    public class EmpresasController : ControllerBase
    {
        private readonly ContextMongoDb _context;
        public EmpresasController(ContextMongoDb context) => _context = context;

        // Pega o ID da empresa direto do Token JWT
        private string? EmpresaId => User.FindFirstValue("empresa_id");

        // ==========================================
        // BUSCAR AS CONFIGURAÇÕES ATUAIS
        // ==========================================
        [HttpGet("configuracoes")]
        public async Task<IActionResult> GetConfiguracoes()
        {
            if (string.IsNullOrWhiteSpace(EmpresaId)) return Forbid();
            
            var empresa = await _context.Empresas.Find(e => e.Id == EmpresaId).FirstOrDefaultAsync();
            if (empresa == null) return NotFound();

            return Ok(new
            {
                corPrimaria = empresa.CorPrimaria,
                logoUrl = empresa.LogoUrl,
                fotoCapaUrl = empresa.FotoCapaUrl,
                instagram = empresa.Instagram,
                endereco = empresa.Endereco
            });
        }

        // ==========================================
        // SALVAR AS CONFIGURAÇÕES (CORES, TEXTOS)
        // ==========================================
        [HttpPut("configuracoes")]
        public async Task<IActionResult> UpdateConfiguracoes([FromBody] AtualizarConfiguracoesDto dados)
        {
            if (string.IsNullOrWhiteSpace(EmpresaId)) return Forbid();
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            var empresa = await _context.Empresas.Find(e => e.Id == EmpresaId).FirstOrDefaultAsync();
            if (empresa == null) return NotFound();

            // Atualiza os campos de personalização
            empresa.CorPrimaria = string.IsNullOrWhiteSpace(dados.CorPrimaria) ? "#6F3CE7" : dados.CorPrimaria;
            empresa.LogoUrl = dados.LogoUrl ?? "";
            empresa.FotoCapaUrl = dados.FotoCapaUrl ?? "";
            empresa.Instagram = dados.Instagram ?? "";
            empresa.Endereco = dados.Endereco ?? "";
            empresa.AlteradoEm = DateTime.UtcNow;

            await _context.Empresas.ReplaceOneAsync(e => e.Id == EmpresaId, empresa);

            return Ok(new { mensagem = "Configurações atualizadas com sucesso." });
        }

        // ==========================================
        // FAZER UPLOAD DE IMAGEM (LOGO OU CAPA)
        // ==========================================
        [HttpPost("upload")]
        public async Task<IActionResult> UploadImagem(IFormFile arquivo)
        {
            if (arquivo == null || arquivo.Length == 0)
                return BadRequest(new { mensagem = "Nenhuma imagem enviada." });

            // 1. Validação de segurança: Só aceita imagens
            var extensoesPermitidas = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var extensao = Path.GetExtension(arquivo.FileName).ToLowerInvariant();
            
            if (!extensoesPermitidas.Contains(extensao))
                return BadRequest(new { mensagem = "Formato inválido. Envie JPG, PNG ou WEBP." });

            // 2. Limite de tamanho (5MB)
            if (arquivo.Length > 5 * 1024 * 1024)
                return BadRequest(new { mensagem = "A imagem deve ter no máximo 5MB." });

            // 3. Define a pasta onde a imagem será salva (wwwroot/uploads)
            var pastaUploads = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            
            // Cria a pasta se ela não existir
            if (!Directory.Exists(pastaUploads))
                Directory.CreateDirectory(pastaUploads);

            // 4. Gera um nome único para o arquivo (evita arquivos com o mesmo nome)
            var nomeArquivo = Guid.NewGuid().ToString() + extensao;
            var caminhoCompleto = Path.Combine(pastaUploads, nomeArquivo);

            // 5. Salva o arquivo fisicamente no servidor
            using (var stream = new FileStream(caminhoCompleto, FileMode.Create))
            {
                await arquivo.CopyToAsync(stream);
            }

            // 6. Retorna a URL pública da imagem para o React
            var urlBase = $"{Request.Scheme}://{Request.Host}";
            var urlImagem = $"{urlBase}/uploads/{nomeArquivo}";

            return Ok(new { url = urlImagem });
        }
    }

    // DTO para receber os dados do React de forma segura
    public class AtualizarConfiguracoesDto
    {
        public string? CorPrimaria { get; set; }
        public string? LogoUrl { get; set; }
        public string? FotoCapaUrl { get; set; }
        public string? Instagram { get; set; }
        public string? Endereco { get; set; }
    }
}