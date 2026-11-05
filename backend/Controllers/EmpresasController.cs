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

            // Retornamos apenas o que o React precisa para a tela de configurações
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
        // SALVAR AS CONFIGURAÇÕES
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

            // Substitui no banco de dados
            await _context.Empresas.ReplaceOneAsync(e => e.Id == EmpresaId, empresa);

            return Ok(new { mensagem = "Configurações atualizadas com sucesso." });
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