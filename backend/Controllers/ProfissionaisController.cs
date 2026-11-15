using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Security.Claims;
using Zlora.Data;
using Zlora.Models;

namespace Zlora.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/profissionais")]
    public class ProfissionaisController : ControllerBase
    {
        private readonly ContextMongoDb _context;
        public ProfissionaisController(ContextMongoDb context) => _context = context;

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
    }
}