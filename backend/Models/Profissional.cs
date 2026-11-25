using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace Zlora.Models
{
    // NOVO: Classe que representa um turno específico (ex: 09:00 às 12:00)
    public class Turno
    {
        [BsonElement("inicio")]
        public string Inicio { get; set; } = "09:00";
        
        [BsonElement("fim")]
        public string Fim { get; set; } = "18:00";
    }

    // CLASSE ATUALIZADA: Agora aceita uma lista de turnos
    public class HorarioDia
    {
        [BsonElement("ativo")]
        public bool Ativo { get; set; } = true;
        
        [BsonElement("turnos")]
        public List<Turno> Turnos { get; set; } = new List<Turno>();

        [BsonElement("inicio")]
        public string? Inicio { get; set; }

        [BsonElement("fim")]
        public string? Fim { get; set; }
    }

    public class BloqueioAgenda
    {
        [BsonElement("id")]
        public string Id { get; set; } = "";

        [BsonElement("data")]
        public string Data { get; set; } = "";

        [BsonElement("inicio")]
        public string? Inicio { get; set; }

        [BsonElement("fim")]
        public string? Fim { get; set; }

        [BsonElement("motivo")]
        public string Motivo { get; set; } = "";
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

        // NOME ALTERADO PARA JORNADA_TRABALHO PARA BATER COM O SEU
        [BsonElement("jornada_trabalho")]
        public Dictionary<string, HorarioDia> JornadaTrabalho { get; set; } = new Dictionary<string, HorarioDia>();

        [BsonElement("bloqueios_agenda")]
        public List<BloqueioAgenda> BloqueiosAgenda { get; set; } = new List<BloqueioAgenda>();

        [BsonElement("criado_em")]
        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

        [BsonElement("alterado_em")]
        public DateTime AlteradoEm { get; set; } = DateTime.UtcNow;
    }
}