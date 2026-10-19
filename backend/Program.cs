using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MongoDB.Driver;
using System.Text;
using Zlora.Data;
using Zlora.Models;

var builder = WebApplication.CreateBuilder(args);

// Eu leio a seção MongoConnection do appsettings.json, seguindo a organização que usei em VasosInteligentes.
builder.Services.Configure<MongoSettings>(builder.Configuration.GetSection("MongoConnection"));
// Eu disponibilizo o contexto para os Controllers acessarem as coleções do mesmo banco.
builder.Services.AddSingleton<ContextMongoDb>();

// Eu uso o PasswordHasher do próprio ASP.NET Core para nunca salvar a senha original no MongoDB.
builder.Services.AddScoped<IPasswordHasher<Usuario>, PasswordHasher<Usuario>>();
// Eu configuro Controllers como uma API porque as telas são renderizadas pelo React, não por Views Razor.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
// Eu habilito o Swagger para visualizar e testar os endpoints durante o desenvolvimento.
builder.Services.AddSwaggerGen(options =>
{
    // Eu habilito o campo de token no Swagger para conseguir testar rotas protegidas depois do login.
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Informe o token JWT recebido no login."
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            }, Array.Empty<string>()
        }
    });
});

// Eu permito que o React local chame a API durante o desenvolvimento.
// Se o Vite usar outra porta, eu preciso atualizar esta origem.
builder.Services.AddCors(options => options.AddPolicy("FrontendZlora", policy =>
    policy.WithOrigins("http://localhost:5173")
          .AllowAnyHeader()
          .AllowAnyMethod()));

// Eu leio os dados usados para assinar e validar os tokens de autenticação.
var jwt = builder.Configuration.GetSection("Jwt");
var chave = builder.Configuration["Jwt:SecretKey"] ?? "";
// Eu não deixo a API iniciar com a chave de exemplo, pois isso permitiria falsificar tokens.
if (chave.Length < 32 || chave.StartsWith("TROQUE_", StringComparison.OrdinalIgnoreCase))
    throw new InvalidOperationException("Configure Jwt:SecretKey com uma chave aleatória de pelo menos 32 caracteres. Consulte o README.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Eu valido emissor, público, assinatura e validade para não aceitar tokens adulterados ou expirados.
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwt["Issuer"],
            ValidateAudience = true,
            ValidAudience = jwt["Audience"],
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(chave)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    });
builder.Services.AddAuthorization();

var app = builder.Build();

// Eu crio um índice único para evitar que duas contas usem o mesmo e-mail normalizado.
// Em um banco já existente, preciso resolver e-mails duplicados antes de criar este índice.
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ContextMongoDb>();
    var indiceEmail = new CreateIndexModel<Usuario>(
        Builders<Usuario>.IndexKeys.Ascending(u => u.Email),
        new CreateIndexOptions { Unique = true, Name = "email_unico" });
    await context.Usuarios.Indexes.CreateOneAsync(indiceEmail);
}

if (app.Environment.IsDevelopment())
{
    // Eu deixo o Swagger disponível somente no ambiente de desenvolvimento.
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Eu mantenho a ordem para que CORS e autenticação sejam aplicados antes de chegar aos Controllers.
app.UseCors("FrontendZlora");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
