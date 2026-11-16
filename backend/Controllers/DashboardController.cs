using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Security.Claims;
using Zlora.Data;

namespace Zlora.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/dashboard")]
    public class DashboardController : ControllerBase
    {
        private readonly ContextMongoDb _context;
        public DashboardController(ContextMongoDb context) => _context = context;

        private string? EmpresaId => User.FindFirstValue("empresa_id");

        [HttpGet("resumo")]
        public async Task<IActionResult> GetResumo()
        {
            if (string.IsNullOrWhiteSpace(EmpresaId)) return Forbid();

            var hoje = DateTime.Today;
            var inicioMes = new DateTime(hoje.Year, hoje.Month, 1);

            var agendamentosHoje = await _context.Agendamentos
                .CountDocumentsAsync(a => a.EmpresaId == EmpresaId && a.DataHoraInicio >= hoje && a.DataHoraInicio < hoje.AddDays(1));

            var novosClientes = await _context.Clientes
                .CountDocumentsAsync(c => c.EmpresaId == EmpresaId && c.CriadoEm >= inicioMes);

            var pipeline = new BsonDocument[]
            {
                new BsonDocument("$match", new BsonDocument
                {
                    { "empresa_id", EmpresaId },
                    { "status", "concluido" },
                    { "data_hora_inicio", new BsonDocument("$gte", inicioMes) }
                }),
                new BsonDocument("$lookup", new BsonDocument
                {
                    { "from", "servicos" },
                    { "localField", "servico_id" },
                    { "foreignField", "_id" },
                    { "as", "servico_detalhes" }
                }),
                new BsonDocument("$unwind", "$servico_detalhes"),
                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", BsonNull.Value },
                    { "total", new BsonDocument("$sum", "$servico_detalhes.preco") }
                })
            };

            var faturamentoResult = await _context.Agendamentos.Aggregate<BsonDocument>(pipeline).FirstOrDefaultAsync();
            var faturamentoMes = faturamentoResult != null && faturamentoResult.Contains("total") 
                ? faturamentoResult["total"].ToDecimal() 
                : 0;

            return Ok(new { agendamentosHoje, faturamentoMes, novosClientes });
        }

        [HttpGet("grafico-faturamento")]
        public async Task<IActionResult> GetGraficoFaturamento()
        {
            if (string.IsNullOrWhiteSpace(EmpresaId)) return Forbid();
            var dataLimite = DateTime.UtcNow.Date.AddDays(-6);

            var pipeline = new BsonDocument[]
            {
                new BsonDocument("$match", new BsonDocument
                {
                    { "empresa_id", EmpresaId },
                    { "status", "concluido" },
                    { "data_hora_inicio", new BsonDocument("$gte", dataLimite) }
                }),
                new BsonDocument("$lookup", new BsonDocument
                {
                    { "from", "servicos" },
                    { "localField", "servico_id" },
                    { "foreignField", "_id" },
                    { "as", "servico" }
                }),
                new BsonDocument("$unwind", "$servico"),
                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", new BsonDocument("$dateToString", new BsonDocument
                        {
                            { "format", "%Y-%m-%d" },
                            { "date", "$data_hora_inicio" }
                        })
                    },
                    { "faturamento", new BsonDocument("$sum", "$servico.preco") }
                }),
                new BsonDocument("$sort", new BsonDocument("_id", 1))
            };

            var resultados = await _context.Agendamentos.Aggregate<BsonDocument>(pipeline).ToListAsync();

            var dadosFormatados = resultados.Select(r => new
            {
                data = DateTime.Parse(r["_id"].AsString).ToString("dd/MM"),
                valor = r["faturamento"].ToDecimal()
            }).ToList();

            return Ok(dadosFormatados);
        }
    }
}