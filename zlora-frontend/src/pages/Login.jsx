import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiMail, FiLock, FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import logoZlora from '../assets/logo.png'; // <-- IMPORTAÇÃO DA LOGO

const loginSchema = z.object({
  email: z.string().email('Informe um e-mail válido.'),
  senha: z.string().min(1, 'A senha é obrigatória.'),
});

const BG_IMAGE = "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [erroGeral, setErroGeral] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data) => {
    try {
      setErroGeral('');
      const usuarioLogado = await login(data.email, data.senha);
      
      if (usuarioLogado.papel === 'cliente') {
        navigate('/cliente/dashboard'); 
      } else if (usuarioLogado.papel === 'profissional') {
        navigate('/profissional/agenda');
      } else {
        navigate('/dashboard');         
      }
    } catch (err) {
      setErroGeral(
        err.response?.data?.message || 
        err.message || 
        'E-mail ou senha incorretos.'
      );
    }
  };

  return (
    <div className="auth-container">
      
      {/* LADO ESQUERDO: IMAGEM E BRANDING */}
      <div className="auth-left" style={{ backgroundImage: `url(${BG_IMAGE})` }}>
        <div>
          <Link to="/" style={{ textDecoration: 'none' }}>
            {/* LOGO BRANCA (INVERTIDA) PARA O FUNDO ESCURO */}
            <img 
              src={logoZlora} 
              alt="Zlora" 
              style={{ height: '60px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} 
            />
          </Link>
          
          <div style={{ marginTop: '120px' }}>
            <h1>Bem-vindo de volta.</h1>
            <p>Acesse sua conta e continue gerenciando seu salão, barbearia ou clínica com a melhor plataforma do mercado.</p>
          </div>
        </div>

        <div className="auth-testimonial">
          <p>"Reduzi as faltas em quase 40% com os lembretes automáticos. Minha agenda nunca esteve tão organizada."</p>
          <strong>Camila Andrade - Studio Camila</strong>
        </div>
      </div>

      {/* LADO DIREITO: FORMULÁRIO DE LOGIN */}
      <div className="auth-right">
        <div className="auth-form-wrapper">
          
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--zlora-text-soft)', textDecoration: 'none', fontWeight: '600', fontSize: '14px', marginBottom: '40px' }}>
            <FiArrowLeft /> Voltar para o site
          </Link>

          <div style={{ marginBottom: '32px' }}>
            {/* LOGO COLORIDA PARA O FUNDO CLARO */}
            <img 
              src={logoZlora} 
              alt="Zlora" 
              style={{ height: '50px', objectFit: 'contain', marginBottom: '24px' }} 
            />
            
            <h2 style={{ fontSize: '1.8rem', color: 'var(--zlora-dark)', marginBottom: '8px', fontFamily: 'Outfit' }}>
              Acesse sua conta
            </h2>
            <p style={{ color: 'var(--zlora-text-soft)', fontSize: '15px', margin: 0 }}>
              Insira suas credenciais para continuar.
            </p>
          </div>

          {erroGeral && (
            <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '12px 16px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', fontWeight: '500' }}>
              {erroGeral}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            
            {/* E-MAIL */}
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="email" style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--zlora-dark)', marginBottom: '8px' }}>
                E-mail profissional
              </label>
              <div style={{ position: 'relative' }}>
                <FiMail style={{ position: 'absolute', left: '16px', top: '16px', color: '#9CA3AF' }} size={20} />
                <input
                  id="email"
                  type="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="seu@email.com"
                  style={{ padding: '14px 14px 14px 44px', borderRadius: '12px', background: '#fff' }}
                  {...register('email')}
                />
              </div>
              {errors.email && <small style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.email.message}</small>}
            </div>

            {/* SENHA */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label htmlFor="senha" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--zlora-dark)' }}>
                  Senha
                </label>
                <a href="#recuperar" style={{ fontSize: '13px', color: 'var(--zlora-primary)', textDecoration: 'none', fontWeight: '600' }}>
                  Esqueceu a senha?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <FiLock style={{ position: 'absolute', left: '16px', top: '16px', color: '#9CA3AF' }} size={20} />
                <input
                  id="senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  className={`form-control ${errors.senha ? 'is-invalid' : ''}`}
                  placeholder="Sua senha"
                  style={{ padding: '14px 44px 14px 44px', borderRadius: '12px', background: '#fff' }}
                  {...register('senha')}
                />
                <button 
                  type="button" 
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 0, color: '#9CA3AF', cursor: 'pointer' }}
                >
                  {mostrarSenha ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
              {errors.senha && <small style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.senha.message}</small>}
            </div>

            {/* BOTÃO ENTRAR */}
            <button 
              type="submit" 
              disabled={isSubmitting} 
              style={{ 
                width: '100%', background: 'var(--zlora-primary)', color: '#fff', 
                padding: '16px', border: 'none', borderRadius: '12px', fontSize: '16px', 
                fontWeight: '700', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 24px rgba(111, 60, 231, 0.3)',
                opacity: isSubmitting ? 0.7 : 1,
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
              }}
            >
              {isSubmitting ? 'Entrando...' : 'Acessar Painel'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '28px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }}></div>
            <span style={{ padding: '0 16px', color: '#9CA3AF', fontSize: '13px', fontWeight: '500' }}>Novo por aqui?</span>
            <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }}></div>
          </div>

          {/* LINK PARA CADASTRO */}
          <Link 
            to="/cadastro" 
            style={{ 
              display: 'block', width: '100%', textAlign: 'center', padding: '16px', 
              background: '#F6F4FF', color: 'var(--zlora-primary)', borderRadius: '12px', 
              textDecoration: 'none', fontWeight: '700', fontSize: '15px',
              border: '1.5px solid var(--zlora-primary-soft)'
            }}
          >
            Criar conta grátis
          </Link>

        </div>
      </div>
    </div>
  );
}