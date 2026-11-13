using Microsoft.AspNetCore.Mvc;
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

        // Busca os dados do salão e os serviços pelo link (Slug)
        [HttpGet("{slug}")]
        public async Task<IActionResult> GetSalao(string slug)
        {
            var empresa = await _context.Empresas.Find(e => e.Slug == slug && e.Status == "ativa").FirstOrDefaultAsync();
            if (empresa == null) return NotFound(new { mensagem = "Estabelecimento não encontrado." });

            var servicos = await _context.Servicos
                .Find(s => s.EmpresaId == empresa.Id && s.Status == "ativo")
                .SortBy(s => s.Nome).ToListAsync();

            return Ok(new
            {
                // ADICIONAMOS OS CAMPOS DE PERSONALIZAÇÃO AQUI
                empresa = new { 
                    id = empresa.Id, 
                    nome = empresa.NomeFantasia, 
                    slug = empresa.Slug,
                    corPrimaria = empresa.CorPrimaria,
                    logoUrl = empresa.LogoUrl,
                    fotoCapaUrl = empresa.FotoCapaUrl,
                    instagram = empresa.Instagram,
                    endereco = empresa.Endereco
                },
                servicos
            });
        }
    }
}