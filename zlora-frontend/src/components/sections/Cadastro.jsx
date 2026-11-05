import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import SectionTitle from '../ui/SectionTitle';
import { cadastroSchema } from '../../schemas/cadastroSchema';
import { useAuth } from '../../contexts/AuthContext';

// Schema de validação específico para o Cliente (Pessoa Física)
const clienteSchema = z.object({
  nome: z.string().trim().min(3, 'Informe seu nome completo.'),
  email: z.string().email('Informe um e-mail válido.'),
  telefone: z.string().trim().min(10, 'Informe um telefone válido com DDD.'),
  senha: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
});

export default function Cadastro() {
  const [tipo, setTipo] = useState('negocio'); // 'negocio' | 'cliente'
  const [erroServidor, setErroServidor] = useState('');
  const [sucessoCliente, setSucessoCliente] = useState('');
  
  const { register: registerUser } = useAuth(); // Função do Contexto para cadastrar o Negócio
  const navigate = useNavigate();

  // ==========================================
  // 1. FORMULÁRIO DE NEGÓCIO
  // ==========================================
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(cadastroSchema) });

  const onSubmitNegocio = async (data) => {
    try {
      setErroServidor('');
      // registerUser chama a API /api/auth/register e já loga o dono do salão
      await registerUser(data);
      navigate('/dashboard');
    } catch (err) {
      setErroServidor(err.message);
    }
  };

  // ==========================================
  // 2. FORMULÁRIO DE CLIENTE
  // ==========================================
  const {
    register: registerCli,
    handleSubmit: handleSubmitCli,
    formState: { errors: errorsCli, isSubmitting: isSubmittingCli },
  } = useForm({ resolver: zodResolver(clienteSchema) });

  const onSubmitCliente = async (data) => {
    try {
      setErroServidor('');
      setSucessoCliente('');

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Chama a rota de cadastro de cliente no C#
      const response = await fetch(`${API_URL}/api/auth/register-cliente`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || resData.mensagem || 'Erro ao criar conta de cliente.');
      }

      setSucessoCliente('Conta criada com sucesso! Redirecionando para o login...');
      
      // Redireciona para a tela de login após 2.5 segundos
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setErroServidor(err.message);
    }
  };

  // Limpa mensagens ao trocar de aba
  const handleMudarTipo = (novoTipo) => {
    setTipo(novoTipo);
    setErroServidor('');
    setSucessoCliente('');
  };

  return (
    <section className="section" id="cadastro">
      <div className="container">
        <SectionTitle
          title="Selecione a opção e"
          highlight="cadastre-se"
          subtitle="Experimente todas as funcionalidades grátis por 30 dias, sem compromisso."
        />

        <div className="row justify-content-center">
          <div className="col-lg-9 col-md-12">
            
            {/* BOTÕES DE SELEÇÃO (NEGÓCIO x CLIENTE) */}
            <div className="d-flex justify-content-center mb-5">
              <div
                className="btn-group type-switch flex-wrap justify-content-center"
                role="group"
                aria-label="Tipo de cadastro"
              >
                <button
                  type="button"
                  className={`btn btn-type-customer ${tipo === 'negocio' ? 'active' : ''}`}
                  aria-pressed={tipo === 'negocio'}
                  onClick={() => handleMudarTipo('negocio')}
                >
                  Tenho um negócio
                  <span className="type-hint">Salão, barbearia ou clínica</span>
                </button>
                <button
                  type="button"
                  className={`btn btn-type-customer ${tipo === 'cliente' ? 'active' : ''}`}
                  aria-pressed={tipo === 'cliente'}
                  onClick={() => handleMudarTipo('cliente')}
                >
                  Sou cliente
                  <span className="type-hint">De estabelecimento</span>
                </button>
              </div>
            </div>

            {/* MENSAGENS DE FEEDBACK DA API */}
            {erroServidor && (
              <div className="alert alert-info" style={{ background: '#FEE2E2', color: '#991B1B', borderLeftColor: '#DC2626', marginBottom: '24px' }}>
                {erroServidor}
              </div>
            )}
            {sucessoCliente && (
              <div className="alert alert-info" style={{ background: '#DCFCE7', color: '#166534', borderLeftColor: '#22C55E', marginBottom: '24px' }}>
                {sucessoCliente}
              </div>
            )}

            {/* ========================================== */}
            {/* RENDERIZAÇÃO: FORMULÁRIO DE CLIENTE        */}
            {/* ========================================== */}
            {tipo === 'cliente' ? (
              <form onSubmit={handleSubmitCli(onSubmitCliente)} noValidate>
                <div className="row">
                  <div className="col-lg-12">
                    <div className="form-group">
                      <label htmlFor="cli-nome">Seu Nome Completo <span aria-hidden="true">*</span></label>
                      <input
                        id="cli-nome"
                        className={`form-control ${errorsCli.nome ? 'is-invalid' : ''}`}
                        autoComplete="name"
                        placeholder="Ex: Maria Silva"
                        {...registerCli('nome')}
                      />
                      {errorsCli.nome && (
                        <small className="form-error is-visible">{errorsCli.nome.message}</small>
                      )}
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="form-group">
                      <label htmlFor="cli-email">E-mail <span aria-hidden="true">*</span></label>
                      <input
                        id="cli-email"
                        type="email"
                        className={`form-control ${errorsCli.email ? 'is-invalid' : ''}`}
                        autoComplete="email"
                        placeholder="seu@email.com"
                        {...registerCli('email')}
                      />
                      {errorsCli.email && (
                        <small className="form-error is-visible">{errorsCli.email.message}</small>
                      )}
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="form-group">
                      <label htmlFor="cli-telefone">Celular <span aria-hidden="true">*</span></label>
                      <input
                        id="cli-telefone"
                        className={`form-control ${errorsCli.telefone ? 'is-invalid' : ''}`}
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="(00) 00000-0000"
                        {...registerCli('telefone')}
                      />
                      {errorsCli.telefone && (
                        <small className="form-error is-visible">{errorsCli.telefone.message}</small>
                      )}
                    </div>
                  </div>

                  <div className="col-lg-12">
                    <div className="form-group">
                      <label htmlFor="cli-senha">Senha de Acesso <span aria-hidden="true">*</span></label>
                      <input
                        id="cli-senha"
                        type="password"
                        className={`form-control ${errorsCli.senha ? 'is-invalid' : ''}`}
                        autoComplete="new-password"
                        placeholder="Mínimo de 6 caracteres"
                        {...registerCli('senha')}
                      />
                      <small className="form-hint">Sua senha deve ter no mínimo 6 caracteres.</small>
                      {errorsCli.senha && (
                        <small className="form-error is-visible">{errorsCli.senha.message}</small>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-center mt-4">
                  <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmittingCli}>
                    {isSubmittingCli ? 'Criando conta...' : 'Criar conta de Cliente'}
                  </button>
                  <p className="form-note mt-3">
                    Já tem uma conta? <a href="/login" className="text-barber2">Faça login aqui</a>.
                  </p>
                </div>
              </form>
            ) : (
              
              /* ========================================== */
              /* RENDERIZAÇÃO: FORMULÁRIO DE NEGÓCIO        */
              /* ========================================== */
              <form onSubmit={handleSubmit(onSubmitNegocio)} noValidate>
                <div className="row">
                  <div className="col-lg-12">
                    <div className="form-group">
                      <label htmlFor="nome">Nome do estabelecimento <span aria-hidden="true">*</span></label>
                      <input 
                        id="nome" 
                        className={`form-control ${errors.nome ? 'is-invalid' : ''}`} 
                        autoComplete="organization" 
                        placeholder="Ex: Studio Bella"
                        {...register('nome')} 
                      />
                      {errors.nome && <small className="form-error is-visible">{errors.nome.message}</small>}
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="form-group">
                      <label htmlFor="nomecontato">Nome do contato <span aria-hidden="true">*</span></label>
                      <input 
                        id="nomecontato" 
                        className={`form-control ${errors.nomecontato ? 'is-invalid' : ''}`} 
                        autoComplete="name" 
                        placeholder="Ex: João Silva"
                        {...register('nomecontato')} 
                      />
                      {errors.nomecontato && <small className="form-error is-visible">{errors.nomecontato.message}</small>}
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="form-group">
                      <label htmlFor="telefone">Celular do contato <span aria-hidden="true">*</span></label>
                      <input 
                        id="telefone" 
                        className={`form-control ${errors.telefone ? 'is-invalid' : ''}`} 
                        inputMode="tel" 
                        autoComplete="tel" 
                        placeholder="(00) 00000-0000" 
                        {...register('telefone')} 
                      />
                      {errors.telefone && <small className="form-error is-visible">{errors.telefone.message}</small>}
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="form-group">
                      <label htmlFor="email">E-mail para acesso <span aria-hidden="true">*</span></label>
                      <input 
                        id="email" 
                        type="email" 
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`} 
                        autoComplete="email" 
                        placeholder="seu@email.com"
                        {...register('email')} 
                      />
                      {errors.email && <small className="form-error is-visible">{errors.email.message}</small>}
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="form-group">
                      <label htmlFor="senha">Senha <span aria-hidden="true">*</span></label>
                      <input 
                        id="senha" 
                        type="password" 
                        className={`form-control ${errors.senha ? 'is-invalid' : ''}`} 
                        autoComplete="new-password" 
                        placeholder="Entre 6 e 15 caracteres"
                        {...register('senha')} 
                      />
                      <small className="form-hint">Entre 6 e 15 caracteres.</small>
                      {errors.senha && <small className="form-error is-visible">{errors.senha.message}</small>}
                    </div>
                  </div>

                  <div className="col-lg-12">
                    <div className="form-group form-check">
                      <input 
                        id="conduso" 
                        type="checkbox" 
                        className={`form-check-input ${errors.conduso ? 'is-invalid' : ''}`} 
                        {...register('conduso')} 
                      />
                      <label className="form-check-label" htmlFor="conduso">
                        Li e aceito o <a href="#termos" className="text-barber2">Termo de Condição de Uso</a>.
                      </label>
                      {errors.conduso && <small className="form-error is-visible">{errors.conduso.message}</small>}
                    </div>
                  </div>
                </div>

                <div className="text-center mt-4">
                  <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>
                    {isSubmitting ? 'Criando conta...' : 'Cadastrar Negócio'}
                  </button>
                  <p className="form-note mt-3">
                    Ao se cadastrar, você será redirecionado para o seu painel.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}