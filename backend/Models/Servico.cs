using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace Zlora.Models
{
    // Eu represento um serviço oferecido por um estabelecimento, com duração e preço.
    public class Servico
    {
        // Eu mapeio o identificador do MongoDB como string no C# para facilitar o uso nas rotas da API.
        [BsonId, BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        [BsonElement("empresa_id"), BsonRepresentation(BsonType.ObjectId)]
        public string EmpresaId { get; set; } = "";
        [BsonElement("nome"), Required, StringLength(120)]
        public string Nome { get; set; } = "";
        [BsonElement("descricao")]
        public string Descricao { get; set; } = "";
        // Eu limito a duração a valores positivos e plausíveis para um serviço.
        [BsonElement("duracao_minutos"), Range(5, 1440)]
        public int DuracaoMinutos { get; set; } = 60;
        // Eu uso decimal no C# e Decimal128 no MongoDB para representar valores monetários.
        [BsonElement("preco"), BsonRepresentation(BsonType.Decimal128), Range(typeof(decimal), "0", "9999999")]
        public decimal Preco { get; set; }
        [BsonElement("status")]
        public string Status { get; set; } = "ativo";
        [BsonElement("criado_em")]
        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
        [BsonElement("alterado_em")]
        public DateTime AlteradoEm { get; set; } = DateTime.UtcNow;
    }
}
