using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace Zlora.Models
{
    // Eu represento o estabelecimento que assina e utiliza a plataforma Zlora.
    public class Empresa
    {
        // Eu mapeio o identificador do MongoDB como string no C# para facilitar o uso nas rotas da API.
        [BsonId, BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        [BsonElement("nome_fantasia"), Required, StringLength(120)]
        public string NomeFantasia { get; set; } = "";
        [BsonElement("razao_social")]
        public string? RazaoSocial { get; set; }
        [BsonElement("cnpj")]
        public string? Cnpj { get; set; }
        // Eu guardo o ID do usuário que criou e é proprietário do estabelecimento.
        [BsonElement("proprietario_usuario_id"), BsonRepresentation(BsonType.ObjectId)]
        public string? ProprietarioUsuarioId { get; set; }
        [BsonElement("status")]
        public string Status { get; set; } = "ativa";
        [BsonElement("criado_em")]
        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
        [BsonElement("alterado_em")]
        public DateTime AlteradoEm { get; set; } = DateTime.UtcNow;
    }
}
