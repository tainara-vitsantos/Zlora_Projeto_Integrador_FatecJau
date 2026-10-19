using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Security.Claims;
using Zlora.Data;
using Zlora.Models;

namespace Zlora.Controllers
{
    // Eu exijo autenticação em todas as operações de serviços.
    [ApiController]
    [Authorize]
    [Route("api/servicos")]
    public class ServicosController : ControllerBase
    {
        private readonly ContextMongoDb _context;
        public ServicosController(ContextMongoDb context) => _context = context;

        // Eu leio a empresa diretamente das informações do JWT validado.
        private string? EmpresaId => User.FindFirstValue("empresa_id");

        // Eu retorno apenas os serviços pertencentes à empresa autenticada.
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            if (string.IsNullOrWhiteSpace(EmpresaId)) return Forbid();
            return Ok(await _context.Servicos.Find(s => s.EmpresaId == EmpresaId).SortBy(s => s.Nome).ToListAsync());
        }

        // Eu verifico ID e empresa juntos para não revelar serviços de outro estabelecimento.
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            if (!ObjectId.TryParse(id, out _) || string.IsNullOrWhiteSpace(EmpresaId)) return NotFound();
            var servico = await _context.Servicos.Find(s => s.Id == id && s.EmpresaId == EmpresaId).FirstOrDefaultAsync();
            return servico == null ? NotFound() : Ok(servico);
        }

        // Eu gero ID, empresa e datas no servidor para não confiar nesses campos vindos do React.
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Servico servico)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            if (string.IsNullOrWhiteSpace(EmpresaId)) return Forbid();
            servico.Id = ObjectId.GenerateNewId().ToString(); servico.EmpresaId = EmpresaId;
            servico.CriadoEm = DateTime.UtcNow; servico.AlteradoEm = DateTime.UtcNow;
            await _context.Servicos.InsertOneAsync(servico);
            return CreatedAtAction(nameof(GetById), new { id = servico.Id }, servico);
        }

        // Eu altero os campos editáveis sem permitir que a requisição mude a empresa dona do serviço.
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] Servico dados)
        {
            if (!ObjectId.TryParse(id, out _) || string.IsNullOrWhiteSpace(EmpresaId)) return NotFound();
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            var existente = await _context.Servicos.Find(s => s.Id == id && s.EmpresaId == EmpresaId).FirstOrDefaultAsync();
            if (existente == null) return NotFound();
            existente.Nome = dados.Nome.Trim(); existente.Descricao = dados.Descricao;
            existente.DuracaoMinutos = dados.DuracaoMinutos; existente.Preco = dados.Preco;
            existente.Status = dados.Status; existente.AlteradoEm = DateTime.UtcNow;
            await _context.Servicos.ReplaceOneAsync(s => s.Id == id && s.EmpresaId == EmpresaId, existente);
            return NoContent();
        }

        // Eu limito a exclusão à empresa do token e informo quando o serviço não foi encontrado.
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            if (!ObjectId.TryParse(id, out _) || string.IsNullOrWhiteSpace(EmpresaId)) return NotFound();
            var resultado = await _context.Servicos.DeleteOneAsync(s => s.Id == id && s.EmpresaId == EmpresaId);
            return resultado.DeletedCount == 0 ? NotFound() : NoContent();
        }
    }
}
