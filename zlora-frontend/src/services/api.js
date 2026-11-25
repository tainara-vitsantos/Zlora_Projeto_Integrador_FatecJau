// src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = {
  request: async (endpoint, options = {}) => {
    // Pega o token salvo pelo AuthContext (Atualizado para Zilora)
    const token = localStorage.getItem('@Zilora:token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Tratamento seguro para respostas vazias (ex: DELETE que retorna 204 No Content)
    let data = {};
    const text = await response.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Resposta não é um JSON válido:", text);
      }
    }

    if (!response.ok) {
      // 1. Tenta pegar mensagem personalizada que você criou no C# (ex: new { mensagem = "..." })
      let mensagemErro = data.message || data.mensagem;

      // 2. Se não tiver, tenta extrair os erros de validação do ASP.NET Core (ModelState)
      if (!mensagemErro && data.errors) {
        const chavesErro = Object.keys(data.errors);
        if (chavesErro.length > 0) {
          mensagemErro = data.errors[chavesErro[0]][0]; // Pega o primeiro erro da lista
        }
      }

      // 3. Se nem isso funcionar, mostra o erro genérico
      throw new Error(mensagemErro || `Erro na requisição (Status ${response.status})`);
    }

    return data;
  }
};