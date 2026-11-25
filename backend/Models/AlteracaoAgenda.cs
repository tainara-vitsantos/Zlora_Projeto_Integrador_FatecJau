using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Zlora.Models;

public class AlteracaoAgenda
{
    [BsonId, BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("empresa_id"), BsonRepresentation(BsonType.ObjectId)]
    public string EmpresaId { get; set; } = "";

    [BsonElement("profissional_id"), BsonRepresentation(BsonType.ObjectId)]
    public string ProfissionalId { get; set; } = "";

    [BsonElement("profissional_nome")]
    public string ProfissionalNome { get; set; } = "";

    [BsonElement("tipo")]
    public string Tipo { get; set; } = "";

    [BsonElement("descricao")]
    public string Descricao { get; set; } = "";

    [BsonElement("criado_em")]
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
}
