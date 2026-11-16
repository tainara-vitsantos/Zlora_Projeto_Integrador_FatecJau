using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace Zlora.Models
{
    public class Profissional
    {
        [BsonId, BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("empresa_id"), BsonRepresentation(BsonType.ObjectId)]
        public string EmpresaId { get; set; } = "";


        // Aqui eu guardo qual conta faz login como esse profissional.
        // Assim a gente consegue descobrir de quem é cada agenda.
        [BsonElement("usuario_id"), BsonRepresentation(BsonType.ObjectId)]
        public string? UsuarioId { get; set; }


        [BsonElement("nome"), Required, StringLength(120)]
        public string Nome { get; set; } = "";

        [BsonElement("especialidade")]
        public string Especialidade { get; set; } = "";

        [BsonElement("telefone")]
        public string Telefone { get; set; } = "";

        [BsonElement("comissao_porcentagem")]
        public decimal ComissaoPorcentagem { get; set; } = 40; // Padrão 40%

        [BsonElement("status")]
        public string Status { get; set; } = "ativo";

        [BsonElement("criado_em")]
        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

        [BsonElement("alterado_em")]
        public DateTime AlteradoEm { get; set; } = DateTime.UtcNow;
    }
}