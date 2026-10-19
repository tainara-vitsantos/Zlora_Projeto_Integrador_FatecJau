using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace Zlora.Models
{
    // Eu represento a conta de acesso. A senha original nunca faz parte deste modelo persistido.
    public class Usuario
    {
        // Eu mapeio o identificador do MongoDB como string no C# para facilitar o uso nas rotas da API.
        [BsonId, BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("nome"), Required, StringLength(100)]
        public string Nome { get; set; } = "";

        [BsonElement("email"), Required, EmailAddress, StringLength(160)]
        public string Email { get; set; } = "";

        [BsonElement("telefone")]
        public string Telefone { get; set; } = "";

        // Eu guardo apenas o resultado do hash gerado pelo PasswordHasher do ASP.NET Core.
        [BsonElement("senha_hash")]
        public string SenhaHash { get; set; } = "";

        [BsonElement("status")]
        public string Status { get; set; } = "ativo";

        [BsonElement("criado_em")]
        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

        [BsonElement("alterado_em")]
        public DateTime AlteradoEm { get; set; } = DateTime.UtcNow;
    }
}
