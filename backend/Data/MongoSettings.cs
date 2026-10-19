namespace Zlora.Data
{
    // Eu reúno as configurações do MongoDB que leio da seção MongoConnection do appsettings.json.
    public class MongoSettings
    {
        public string ConnectionString { get; set; } = "";
        public string Database { get; set; } = "zlora";
        // Eu mantenho esta opção para indicar quando a conexão deve usar TLS, como em serviços hospedados.
        public bool IsSsl { get; set; }
    }
}
