import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Informe um e-mail válido.'),
  senha: z.string().min(1, 'A senha é obrigatória.'),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [erroGeral, setErroGeral] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data) => {
    try {
      setErroGeral('');
      
      const usuarioLogado = await login(data.email, data.senha);
      
      // 🔍 RAIO-X AQUI
      console.log("=== RAIO-X DO LOGIN ===");
      console.log("O que o C# devolveu:", usuarioLogado);
      console.log("Qual é o papel?", usuarioLogado.papel);
      
      if (usuarioLogado.papel === 'cliente') {
        console.log("Redirecionando para área do CLIENTE...");
        navigate('/cliente/dashboard'); 
      } else if (usuarioLogado.papel === 'profissional') {
        console.log("Redirecionando para área do PROFISSIONAL...");
        navigate('/profissional/agenda'); // <-- ROTA DA SUA AMIGA AQUI
      } else {
        console.log("Redirecionando para área do ADMIN...");
        navigate('/dashboard');         
      }
      
    } catch (err) {
      console.error("Erro no login:", err);
      setErroGeral(err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--zlora-bg-alt)', padding: '20px' }}>
      <div className="form-card" style={{ width: '100%', maxWidth: '420px' }}>
        <div className="text-center mb-4">
          <Link to="/" className="navbar-brand" style={{ fontSize: '2rem' }}>Zlora</Link>
          <h2 style={{ marginTop: '20px', marginBottom: '8px' }}>Bem-vindo de volta</h2>
          <p style={{ color: 'var(--zlora-text-soft)' }}>Acesse sua conta para gerenciar seu negócio.</p>
        </div>

        {erroGeral && (
          <div className="alert alert-info" style={{ background: '#FEE2E2', color: '#991B1B', borderLeftColor: '#DC2626' }}>
            {erroGeral}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="seu@email.com"
              {...register('email')}
            />
            {errors.email && <small className="form-error is-visible">{errors.email.message}</small>}
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              className={`form-control ${errors.senha ? 'is-invalid' : ''}`}
              placeholder="Sua senha"
              {...register('senha')}
            />
            {errors.senha && <small className="form-error is-visible">{errors.senha.message}</small>}
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting} style={{ marginTop: '24px' }}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="text-center" style={{ marginTop: '24px', fontSize: '14px' }}>
          <Link to="/" style={{ color: 'var(--zlora-text-soft)' }}>← Voltar para a Home</Link>
        </div>
        
      </div>
    </div>
  );
}