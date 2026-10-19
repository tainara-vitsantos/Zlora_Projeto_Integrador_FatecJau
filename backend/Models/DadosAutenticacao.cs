using System.ComponentModel.DataAnnotations;

namespace Zlora.Models
{
    // Eu represento os campos que o formulário de cadastro envia; não recebo senha_hash do navegador.
    // Eu separo os campos do formulário dos dados que serão persistidos na coleção usuarios.
    public class CadastroUsuario
    {
        [Required, StringLength(120, MinimumLength = 2)] public string Nome { get; set; } = "";
        [Required, StringLength(120, MinimumLength = 2)] public string NomeContato { get; set; } = "";
        [Required, Phone] public string Telefone { get; set; } = "";
        [Required, EmailAddress] public string Email { get; set; } = "";
        [Required, StringLength(100, MinimumLength = 6)] public string Senha { get; set; } = "";
        // Eu uso este campo para respeitar a confirmação do usuário no formulário de cadastro.
      
    }

    // Eu mantenho o login separado do modelo Usuario porque o formulário envia a senha, não o hash.
    // Eu recebo a senha somente para verificá-la; não guardo essa propriedade no documento Usuario.
    public class LoginUsuario
    {
        [Required, EmailAddress] public string Email { get; set; } = "";
        [Required] public string Senha { get; set; } = "";
    }
}
