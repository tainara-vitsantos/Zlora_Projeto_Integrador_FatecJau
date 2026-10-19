using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Zlora.Models
{
    // Eu represento a participação de um usuário em uma empresa, com papel e permissões.
    public class MembroEmpresa
    {
        // Eu mapeio o identificador do MongoDB como string no C# para facilitar o uso nas rotas da API.
        [BsonId, BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        [BsonElement("empresa_id"), BsonRepresentation(BsonType.ObjectId)]
        public string EmpresaId { get; set; } = "";
        [BsonElement("usuario_id"), BsonRepresentation(BsonType.ObjectId)]
        public string UsuarioId { get; set; } = "";
        [BsonElement("papel")]
        public string Papel { get; set; } = "administrador";
        [BsonElement("permissoes")]
        public List<string> Permissoes { get; set; } = new();
        [BsonElement("status")]
        public string Status { get; set; } = "ativo";
        [BsonElement("criado_em")]
        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    }
}
