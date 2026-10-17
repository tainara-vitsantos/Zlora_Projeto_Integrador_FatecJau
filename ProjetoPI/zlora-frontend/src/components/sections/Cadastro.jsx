import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import SectionTitle from '../ui/SectionTitle';
import { cadastroSchema } from '../../schemas/cadastroSchema';

export default function Cadastro() {
  const [tipo, setTipo] = useState('negocio');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(cadastroSchema) });

  const onSubmit = async (data) => {
    // TODO: trocar por chamada real
    console.info('[Zlora] Cadastro:', data);
    await new Promise((r) => setTimeout(r, 500));
    alert('Envio desativado: integração com o servidor ainda não configurada.');
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
                  className={`btn btn-type-customer ${
                    tipo === 'negocio' ? 'active' : ''
                  }`}
                  aria-pressed={tipo === 'negocio'}
                  onClick={() => setTipo('negocio')}
                >
                  Tenho um negócio
                  <span className="type-hint">Salão, barbearia ou clínica</span>
                </button>
                <button
                  type="button"
                  className={`btn btn-type-customer ${
                    tipo === 'cliente' ? 'active' : ''
                  }`}
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
                    {isSubmitting ? 'Enviando...' : 'Cadastrar'}
                  </button>
                  <p className="form-note mt-3">
                    Integração com o servidor ainda não configurada. Ao enviar, os
                    dados não serão gravados.
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