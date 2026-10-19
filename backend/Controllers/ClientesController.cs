using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Security.Claims;
using Zlora.Data;
using Zlora.Models;

namespace Zlora.Controllers
{
    // Eu protejo todas as rotas de clientes: é necessário enviar um JWT válido.
    [ApiController]
    [Authorize]
    [Route("api/clientes")]
    public class ClientesController : ControllerBase
    {
        private readonly ContextMongoDb _context;
        public ClientesController(ContextMongoDb context) => _context = context;

        // Eu obtenho a empresa do token, nunca de um campo enviado pelo navegador.
        private string? EmpresaId => User.FindFirstValue("empresa_id");

        // Eu listo apenas clientes da empresa autenticada.
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            if (string.IsNullOrWhiteSpace(EmpresaId)) return Forbid();
            var clientes = await _context.Clientes.Find(c => c.EmpresaId == EmpresaId).SortBy(c => c.Nome).ToListAsync();
            return Ok(clientes);
        }

        // Eu consulto o cliente pelo ID e pela empresa para impedir acesso cruzado entre empresas.
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            if (!ObjectId.TryParse(id, out _) || string.IsNullOrWhiteSpace(EmpresaId)) return NotFound();
            var cliente = await _context.Clientes.Find(c => c.Id == id && c.EmpresaId == EmpresaId).FirstOrDefaultAsync();
            return cliente == null ? NotFound() : Ok(cliente);
        }

        // Eu recebo os dados do formulário, mas defino o ID, a empresa e as datas no backend.
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Cliente cliente)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            if (string.IsNullOrWhiteSpace(EmpresaId)) return Forbid();
            cliente.Id = ObjectId.GenerateNewId().ToString();
            cliente.EmpresaId = EmpresaId;
            cliente.CriadoEm = DateTime.UtcNow;
            cliente.AlteradoEm = DateTime.UtcNow;
            await _context.Clientes.InsertOneAsync(cliente);
            return CreatedAtAction(nameof(GetById), new { id = cliente.Id }, cliente);
        }

        // Eu atualizo somente os campos permitidos e mantenho a empresa original do documento.
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] Cliente dados)
        {
            if (!ObjectId.TryParse(id, out _) || string.IsNullOrWhiteSpace(EmpresaId)) return NotFound();
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            var existente = await _context.Clientes.Find(c => c.Id == id && c.EmpresaId == EmpresaId).FirstOrDefaultAsync();
            if (existente == null) return NotFound();
            existente.Nome = dados.Nome.Trim(); existente.Cpf = dados.Cpf; existente.Telefone = dados.Telefone;
            existente.Email = dados.Email; existente.DataNascimento = dados.DataNascimento; existente.Observacoes = dados.Observacoes;
            existente.Status = dados.Status; existente.AlteradoEm = DateTime.UtcNow;
            await _context.Clientes.ReplaceOneAsync(c => c.Id == id && c.EmpresaId == EmpresaId, existente);
            return NoContent();
        }

        // Eu excluo apenas um cliente que pertença à empresa autenticada.
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            if (!ObjectId.TryParse(id, out _) || string.IsNullOrWhiteSpace(EmpresaId)) return NotFound();
            var resultado = await _context.Clientes.DeleteOneAsync(c => c.Id == id && c.EmpresaId == EmpresaId);
            return resultado.DeletedCount == 0 ? NotFound() : NoContent();
        }
    }
}
