// src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = {
  request: async (endpoint, options = {}) => {
    // Pega o token que o seu AuthContext salvou
    const token = localStorage.getItem('@Zlora:token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }), // Envia o token para o C#
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.mensagem || 'Erro na requisição');
    }

    return data;
  }
};