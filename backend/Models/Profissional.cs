using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace Zlora.Models
{
    // Classe auxiliar para guardar o horário de um dia específico
    public class HorarioDia
    {
        [BsonElement("ativo")]
        public bool Ativo { get; set; } = true;
        
        [BsonElement("inicio")]
        public string Inicio { get; set; } = "09:00";
        
        [BsonElement("fim")]
        public string Fim { get; set; } = "18:00";
    }

    public class Profissional
    {
        [BsonId, BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("empresa_id"), BsonRepresentation(BsonType.ObjectId)]
        public string EmpresaId { get; set; } = "";

        [BsonElement("usuario_id"), BsonRepresentation(BsonType.ObjectId)]
        public string? UsuarioId { get; set; }

        [BsonElement("nome"), Required, StringLength(120)]
        public string Nome { get; set; } = "";

        [BsonElement("especialidade")]
        public string Especialidade { get; set; } = "";

        [BsonElement("telefone")]
        public string Telefone { get; set; } = "";

        [BsonElement("comissao_porcentagem")]
        public decimal ComissaoPorcentagem { get; set; } = 40;

        [BsonElement("status")]
        public string Status { get; set; } = "ativo";

        // NOVO CAMPO: Dicionário que guarda a jornada de trabalho (Ex: "segunda" -> { ativo: true, inicio: "09:00", fim: "18:00" })
        [BsonElement("jornada_trabalho")]
        public Dictionary<string, HorarioDia> JornadaTrabalho { get; set; } = new Dictionary<string, HorarioDia>();

        [BsonElement("criado_em")]
        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

        [BsonElement("alterado_em")]
        public DateTime AlteradoEm { get; set; } = DateTime.UtcNow;
    }
}