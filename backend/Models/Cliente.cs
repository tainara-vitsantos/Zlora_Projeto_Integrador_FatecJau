using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace Zlora.Models
{
    // Eu represento um cliente cadastrado por um estabelecimento do Zlora.
    public class Cliente
    {
        // Eu mapeio o identificador do MongoDB como string no C# para facilitar o uso nas rotas da API.
        [BsonId, BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        // Eu salvo a empresa dona do cliente e uso esse campo em todas as consultas protegidas.
        [BsonElement("empresa_id"), BsonRepresentation(BsonType.ObjectId)]
        public string EmpresaId { get; set; } = "";
        [BsonElement("nome"), Required, StringLength(120)]
        public string Nome { get; set; } = "";
        [BsonElement("cpf")]
        public string? Cpf { get; set; }
        [BsonElement("telefone"), Required]
        public string Telefone { get; set; } = "";
        [BsonElement("email"), EmailAddress]
        public string? Email { get; set; }
        [BsonElement("data_nascimento")]
        public DateTime? DataNascimento { get; set; }
        [BsonElement("observacoes")]
        public string Observacoes { get; set; } = "";
        [BsonElement("status")]
        public string Status { get; set; } = "ativo";
        [BsonElement("criado_em")]
        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
        [BsonElement("alterado_em")]
        public DateTime AlteradoEm { get; set; } = DateTime.UtcNow;
    }
}
