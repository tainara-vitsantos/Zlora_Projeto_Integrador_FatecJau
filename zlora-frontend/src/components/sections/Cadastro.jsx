import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- Importação nova
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import SectionTitle from '../ui/SectionTitle';
import { cadastroSchema } from '../../schemas/cadastroSchema';
import { useAuth } from '../../contexts/AuthContext'; // <-- Importação nova

export default function Cadastro() {
  const [tipo, setTipo] = useState('negocio');
  const [erroServidor, setErroServidor] = useState(''); // Erro vindo da "API"
  
  const { register: registerUser } = useAuth(); // Apelidado para não confundir com o register do form
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(cadastroSchema) });

  const onSubmit = async (data) => {
    try {
      setErroServidor('');
      // Chama a função mock do Contexto
      await registerUser(data);
      // Redireciona para o Dashboard
      navigate('/dashboard');
    } catch (err) {
      setErroServidor(err.message);
    }
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
                  onClick={() => setTipo('negocio')}
                >
                  Tenho um negócio
                  <span className="type-hint">Salão, barbearia ou clínica</span>
                </button>
                <button
                  type="button"
                  className={`btn btn-type-customer ${tipo === 'cliente' ? 'active' : ''}`}
                  aria-pressed={tipo === 'cliente'}
                  onClick={() => setTipo('cliente')}
                >
                  Sou cliente
                  <span className="type-hint">De estabelecimento</span>
                </button>
              </div>
            </div>

            {tipo === 'cliente' ? (
              <div className="alert alert-info" role="status">
                O cadastro de cliente será disponibilizado em breve.
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                
                {/* Aviso de erro vindo da API */}
                {erroServidor && (
                  <div className="alert alert-info" style={{ background: '#FEE2E2', color: '#991B1B', borderLeftColor: '#DC2626' }}>
                    {erroServidor}
                  </div>
                )}

                <div className="row">
                  <div className="col-lg-12">
                    <div className="form-group">
                      <label htmlFor="nome">
                        Nome do estabelecimento <span aria-hidden="true">*</span>
                      </label>
                      <input
                        id="nome"
                        className={`form-control ${errors.nome ? 'is-invalid' : ''}`}
                        autoComplete="organization"
                        {...register('nome')}
                      />
                      {errors.nome && (
                        <small className="form-error is-visible">
                          {errors.nome.message}
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="form-group">
                      <label htmlFor="nomecontato">
                        Nome do contato <span aria-hidden="true">*</span>
                      </label>
                      <input
                        id="nomecontato"
                        className={`form-control ${
                          errors.nomecontato ? 'is-invalid' : ''
                        }`}
                        autoComplete="name"
                        {...register('nomecontato')}
                      />
                      {errors.nomecontato && (
                        <small className="form-error is-visible">
                          {errors.nomecontato.message}
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="form-group">
                      <label htmlFor="telefone">
                        Celular do contato <span aria-hidden="true">*</span>
                      </label>
                      <input
                        id="telefone"
                        className={`form-control ${
                          errors.telefone ? 'is-invalid' : ''
                        }`}
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="(00) 00000-0000"
                        {...register('telefone')}
                      />
                      {errors.telefone && (
                        <small className="form-error is-visible">
                          {errors.telefone.message}
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="form-group">
                      <label htmlFor="email">
                        E-mail para acesso <span aria-hidden="true">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        autoComplete="email"
                        {...register('email')}
                      />
                      {errors.email && (
                        <small className="form-error is-visible">
                          {errors.email.message}
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="form-group">
                      <label htmlFor="senha">
                        Senha <span aria-hidden="true">*</span>
                      </label>
                      <input
                        id="senha"
                        type="password"
                        className={`form-control ${errors.senha ? 'is-invalid' : ''}`}
                        autoComplete="new-password"
                        {...register('senha')}
                      />
                      <small className="form-hint">Entre 6 e 15 caracteres.</small>
                      {errors.senha && (
                        <small className="form-error is-visible">
                          {errors.senha.message}
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="col-lg-12">
                    <div className="form-group form-check">
                      <input
                        id="conduso"
                        type="checkbox"
                        className={`form-check-input ${
                          errors.conduso ? 'is-invalid' : ''
                        }`}
                        {...register('conduso')}
                      />
                      <label className="form-check-label" htmlFor="conduso">
                        Li e aceito o{' '}
                        <a href="#termos" className="text-barber2">
                          Termo de Condição de Uso
                        </a>
                        .
                      </label>
                      {errors.conduso && (
                        <small className="form-error is-visible">
                          {errors.conduso.message}
                        </small>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-center mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Criando conta...' : 'Cadastrar'}
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