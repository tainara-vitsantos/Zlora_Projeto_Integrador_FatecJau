using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Zlora.Controllers;

public class HomeController : Controller
{
    public IActionResult Index() => View();
    [Authorize(Roles = "Administrador,Secretaria,Profissional")]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public IActionResult Painel() => View();
    public IActionResult Erro() { Response.StatusCode = 500; return View(); }
}
