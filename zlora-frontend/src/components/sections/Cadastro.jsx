import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiBriefcase, FiUser, FiPhone, FiMail, FiLock, FiArrowLeft, FiCheck, FiEye, FiEyeOff, FiLoader } from 'react-icons/fi';
import { cadastroSchema } from '../../schemas/cadastroSchema';
import { useAuth } from '../../contexts/AuthContext';
import logoZlora from '../../assets/logo.png';

const BG_IMAGE = "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1000&q=80";

export default function Cadastro() {
  const [erroServidor, setErroServidor] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(cadastroSchema) });

  const senhaDigitada = watch('senha', '');
  const hasLength = senhaDigitada.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(senhaDigitada);
  const hasNumber = /\d/.test(senhaDigitada);

  const formatarTelefone = (valor) => {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const onSubmit = async (data) => {
    try {
      setErroServidor('');
      await registerUser(data);
      navigate('/dashboard');
    } catch (err) {
      setErroServidor(
        err.response?.data?.message ||
        err.message ||
        'Não foi possível realizar o cadastro. Tente novamente.'
      );
    }
  };

  return (
    <div className="cadastro-container" style={{ position: 'relative' }}>
      
      {/* BOTÃO FLUTUANTE VOLTAR PARA O SITE (GLASSMORPHISM) */}
      <Link 
        to="/" 
        style={{ 
          position: 'absolute', 
          top: '24px', 
          left: '24px', 
          zIndex: 100, 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px', 
          color: '#fff', 
          backgroundColor: 'rgba(255, 255, 255, 0.15)', 
          padding: '10px 20px', 
          borderRadius: '30px', 
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          textDecoration: 'none', 
          fontWeight: '600', 
          fontSize: '14px',
          transition: 'all 0.3s ease'
        }}
      >
        <FiArrowLeft /> Voltar para o site
      </Link>

      {/* LADO ESQUERDO: IMAGEM E BENEFÍCIOS */}
      <div className="cadastro-left" style={{ backgroundImage: `url(${BG_IMAGE})` }}>
        <div style={{ marginTop: '40px' }}> {/* Ajustei a margem para não bater no botão flutuante */}
          <Link to="/" style={{ textDecoration: 'none' }}>
            <img 
              src={logoZlora} 
              alt="Zlora" 
              style={{ height: '60px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} 
            />
          </Link>

          <div style={{ marginTop: '60px' }}>
            <h1>Leve seu salão para o próximo nível.</h1>
            <ul className="beneficios-list">
              {[
                'Agenda online 24 horas por dia',
                'Controle total de comissões',
                'Gestão de clientes e serviços',
                'Relatórios financeiros precisos'
              ].map((item, index) => (
                <li key={index}>
                  <div className="beneficios-icon">
                    <FiCheck size={18} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginTop: 'auto' }}>
          © {new Date().getFullYear()} Zlora. Todos os direitos reservados.
        </div>
      </div>

      {/* LADO DIREITO: FORMULÁRIO */}
      <div className="cadastro-right">
        <div className="cadastro-form-wrapper">
          
          <div style={{ marginBottom: '32px' }}>
            <img 
              src={logoZlora} 
              alt="Zlora" 
              style={{ height: '50px', objectFit: 'contain', marginBottom: '24px' }} 
            />
            <h2 style={{ fontSize: '1.8rem', color: 'var(--zlora-dark)', marginBottom: '8px', fontFamily: 'Outfit' }}>
              Comece seu teste grátis
            </h2>
            <p style={{ color: 'var(--zlora-text-soft)', fontSize: '15px', margin: 0 }}>
              30 dias gratuitos. Não pedimos cartão de crédito.
            </p>
          </div>

          {erroServidor && (
            <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '12px 16px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', fontWeight: '500' }}>
              {erroServidor}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* ETAPA 1: DADOS DO ESTABELECIMENTO */}
            <div className="section-title-form">1. Dados do Estabelecimento</div>

            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="nome" style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--zlora-dark)', marginBottom: '8px' }}>
                Nome do estabelecimento *
              </label>
              <div style={{ position: 'relative' }}>
                <FiBriefcase style={{ position: 'absolute', left: '16px', top: '16px', color: '#9CA3AF' }} size={20} />
                <input
                  id="nome"
                  className={`form-control ${errors.nome ? 'is-invalid' : ''}`}
                  placeholder="Ex: Studio Bella"
                  style={{ padding: '14px 14px 14px 44px', borderRadius: '12px', background: '#fff' }}
                  {...register('nome')}
                />
              </div>
              {errors.nome && <small style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.nome.message}</small>}
            </div>

            <div className="row">
              <div className="col-md-6">
                <div style={{ marginBottom: '16px' }}>
                  <label htmlFor="nomecontato" style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--zlora-dark)', marginBottom: '8px' }}>
                    Seu nome *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <FiUser style={{ position: 'absolute', left: '16px', top: '16px', color: '#9CA3AF' }} size={20} />
                    <input
                      id="nomecontato"
                      className={`form-control ${errors.nomecontato ? 'is-invalid' : ''}`}
                      placeholder="Ex: João Silva"
                      style={{ padding: '14px 14px 14px 44px', borderRadius: '12px', background: '#fff' }}
                      {...register('nomecontato')}
                    />
                  </div>
                  {errors.nomecontato && <small style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.nomecontato.message}</small>}
                </div>
              </div>

              <div className="col-md-6">
                <div style={{ marginBottom: '16px' }}>
                  <label htmlFor="telefone" style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--zlora-dark)', marginBottom: '8px' }}>
                    WhatsApp *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <FiPhone style={{ position: 'absolute', left: '16px', top: '16px', color: '#9CA3AF' }} size={20} />
                    <input
                      id="telefone"
                      className={`form-control ${errors.telefone ? 'is-invalid' : ''}`}
                      placeholder="(00) 00000-0000"
                      inputMode="tel"
                      style={{ padding: '14px 14px 14px 44px', borderRadius: '12px', background: '#fff' }}
                      {...register('telefone')}
                      onChange={(e) => {
                        e.target.value = formatarTelefone(e.target.value);
                        register('telefone').onChange(e);
                      }}
                    />
                  </div>
                  {errors.telefone && <small style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.telefone.message}</small>}
                </div>
              </div>
            </div>

            {/* ETAPA 2: ACESSO À PLATAFORMA */}
            <div className="section-title-form" style={{ marginTop: '16px' }}>2. Acesso à Plataforma</div>

            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="email" style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--zlora-dark)', marginBottom: '8px' }}>
                E-mail profissional *
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

            <div className="row">
              <div className="col-md-6">
                <div style={{ marginBottom: '16px' }}>
                  <label htmlFor="senha" style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--zlora-dark)', marginBottom: '8px' }}>
                    Crie uma senha *
                  </label>
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
                    <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 0, color: '#9CA3AF', cursor: 'pointer' }}>
                      {mostrarSenha ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                    </button>
                  </div>

                  <div className="password-req">
                    <span className={hasLength ? 'valid' : ''}>✓ Mínimo de 8 caracteres</span>
                    <span className={hasLetter ? 'valid' : ''}>✓ Pelo menos uma letra</span>
                    <span className={hasNumber ? 'valid' : ''}>✓ Pelo menos um número</span>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div style={{ marginBottom: '16px' }}>
                  <label htmlFor="confirmarSenha" style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--zlora-dark)', marginBottom: '8px' }}>
                    Confirme a senha *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <FiLock style={{ position: 'absolute', left: '16px', top: '16px', color: '#9CA3AF' }} size={20} />
                    <input
                      id="confirmarSenha"
                      type={mostrarConfirmar ? 'text' : 'password'}
                      className={`form-control ${errors.confirmarSenha ? 'is-invalid' : ''}`}
                      placeholder="Repita a senha"
                      style={{ padding: '14px 44px 14px 44px', borderRadius: '12px', background: '#fff' }}
                      {...register('confirmarSenha')}
                    />
                    <button type="button" onClick={() => setMostrarConfirmar(!mostrarConfirmar)} style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 0, color: '#9CA3AF', cursor: 'pointer' }}>
                      {mostrarConfirmar ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                    </button>
                  </div>
                  {errors.confirmarSenha && <small style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.confirmarSenha.message}</small>}
                </div>
              </div>
            </div>

            {/* ETAPA 3: TERMOS */}
            <div className="section-title-form" style={{ marginTop: '16px' }}>3. Finalização</div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '8px' }}>
              <input
                id="conduso"
                type="checkbox"
                className={`form-check-input ${errors.conduso ? 'is-invalid' : ''}`}
                style={{ marginTop: '4px', cursor: 'pointer', accentColor: 'var(--zlora-primary)' }}
                {...register('conduso')}
              />
              <label htmlFor="conduso" style={{ fontSize: '13px', color: 'var(--zlora-text-soft)', lineHeight: '1.5', cursor: 'pointer' }}>
                Li e aceito os <Link to="/termos" style={{ color: 'var(--zlora-primary)', fontWeight: '600', textDecoration: 'none' }}>Termos de Uso</Link> e a <Link to="/privacidade" style={{ color: 'var(--zlora-primary)', fontWeight: '600', textDecoration: 'none' }}>Política de Privacidade</Link>.
              </label>
            </div>
            {errors.conduso && <small style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.conduso.message}</small>}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%', background: 'var(--zlora-primary)', color: '#fff',
                padding: '16px', border: 'none', borderRadius: '12px', fontSize: '16px',
                fontWeight: '700', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                marginTop: '40px',
                boxShadow: '0 8px 24px rgba(111, 60, 231, 0.3)',
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? (
                <><FiLoader className="spin" /> Criando conta...</>
              ) : (
                'Criar conta e começar'
              )}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }}></div>
            <span style={{ padding: '0 16px', color: '#9CA3AF', fontSize: '13px', fontWeight: '500' }}>Já tem conta?</span>
            <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }}></div>
          </div>

          <Link
            to="/login"
            style={{
              display: 'block', width: '100%', textAlign: 'center', padding: '16px',
              background: '#F6F4FF', color: 'var(--zlora-primary)', borderRadius: '12px',
              textDecoration: 'none', fontWeight: '700', fontSize: '15px',
              border: '1.5px solid var(--zlora-primary-soft)'
            }}
          >
            Fazer login
          </Link>
        </div>
      </div>
    </div>
  );
}