using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Zlora.Models;

namespace Zlora.Data
{
    // Eu reúno aqui o acesso às coleções para não criar uma conexão diferente em cada Controller.
    public class ContextMongoDb
    {
        private readonly IMongoDatabase _database;

        public ContextMongoDb(IOptions<MongoSettings> settings)
        {
            // Eu leio as configurações centralizadas para não repetir a connection string nos Controllers.
            var mongoSettings = settings.Value;
            var clientSettings = MongoClientSettings.FromConnectionString(mongoSettings.ConnectionString);
            if (mongoSettings.IsSsl)
                clientSettings.UseTls = true;

            // Eu crio o cliente do MongoDB uma vez; ele gerencia as conexões internamente.
            var client = new MongoClient(clientSettings);
            _database = client.GetDatabase(mongoSettings.Database);
        }

        // Eu centralizo os nomes das coleções neste arquivo para manter o acesso consistente no projeto.
        public IMongoCollection<Usuario> Usuarios => _database.GetCollection<Usuario>("usuarios");
        public IMongoCollection<Empresa> Empresas => _database.GetCollection<Empresa>("empresas");
        public IMongoCollection<MembroEmpresa> MembrosEmpresa => _database.GetCollection<MembroEmpresa>("membros_empresa");
        public IMongoCollection<Cliente> Clientes => _database.GetCollection<Cliente>("clientes");
        public IMongoCollection<Servico> Servicos => _database.GetCollection<Servico>("servicos");
        public IMongoCollection<Agendamento> Agendamentos => _database.GetCollection<Agendamento>("agendamentos");
    }
}
