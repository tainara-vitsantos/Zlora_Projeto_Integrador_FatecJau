using MongoDB.Driver;
using Zlora.Models;
namespace Zlora.Data;

public class ContextMongoDb
{
    public IMongoCollection<ApplicationUser> Usuarios { get; }
    public IMongoCollection<Empresa> Empresas { get; }
    public ContextMongoDb(IConfiguration configuration)
    {
        var client = new MongoClient(configuration["MongoConnection:ConnectionString"]);
        Usuarios = client.GetDatabase(configuration["MongoConnection:Database"]).GetCollection<ApplicationUser>("usuarios");
        Empresas = client.GetDatabase(configuration["MongoConnection:Database"]).GetCollection<Empresa>("empresas");
    }
    public async Task CriarIndices()
    {
        await Usuarios.Indexes.CreateOneAsync(new CreateIndexModel<ApplicationUser>(
            Builders<ApplicationUser>.IndexKeys.Ascending(u => u.NormalizedEmail), new CreateIndexOptions { Unique = true }));
        await Usuarios.Indexes.CreateOneAsync(new CreateIndexModel<ApplicationUser>(Builders<ApplicationUser>.IndexKeys.Ascending(u => u.EmpresaId)));
    }
}
