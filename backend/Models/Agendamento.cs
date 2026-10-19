using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace Zlora.Models
{
    // Eu represento um horário reservado por um cliente para um serviço.
    public class Agendamento
    {
        // Eu mapeio o identificador do MongoDB como string no C# para facilitar o uso nas rotas da API.
        [BsonId, BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        [BsonElement("empresa_id"), BsonRepresentation(BsonType.ObjectId)]
        public string EmpresaId { get; set; } = "";
        [BsonElement("cliente_id"), BsonRepresentation(BsonType.ObjectId)]
        public string ClienteId { get; set; } = "";
        [BsonElement("profissional_id"), BsonRepresentation(BsonType.ObjectId)]
        public string? ProfissionalId { get; set; }
        [BsonElement("servico_id"), BsonRepresentation(BsonType.ObjectId)]
        public string ServicoId { get; set; } = "";
        // Eu recebo as datas em formato ISO pelo JSON; o backend valida que o fim vem depois do início.
        [BsonElement("data_hora_inicio"), Required]
        public DateTime DataHoraInicio { get; set; }
        [BsonElement("data_hora_fim"), Required]
        public DateTime DataHoraFim { get; set; }
        [BsonElement("status")]
        public string Status { get; set; } = "agendado";
        [BsonElement("observacoes")]
        public string Observacoes { get; set; } = "";
        [BsonElement("criado_em")]
        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
        [BsonElement("alterado_em")]
        public DateTime AlteradoEm { get; set; } = DateTime.UtcNow;
    }
}
