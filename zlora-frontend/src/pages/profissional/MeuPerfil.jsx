import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiUser, FiMail, FiPhone, FiScissors, FiSave } from 'react-icons/fi';
import { api } from '../../services/api';

// Schema de validação com Zod
const perfilSchema = z.object({
  nome: z.string().trim().min(3, 'O nome deve ter pelo menos 3 letras.'),
  telefone: z.string().optional(),
  especialidade: z.string().optional(),
});

export default function MeuPerfil() {
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [email, setEmail] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(perfilSchema) });

  // Busca os dados assim que a tela abre
  useEffect(() => {
    async function carregarPerfil() {
      try {
        const data = await api.request('/api/profissional/perfil');
        setEmail(data.email);
        reset({
          nome: data.nome || '',
          telefone: data.telefone || '',
          especialidade: data.especialidade || '',
        });
      } catch (error) {
        setErro(error.message || 'Não foi possível carregar o perfil.');
      } finally {
        setCarregando(false);
      }
    }
    carregarPerfil();
  }, [reset]);

  // Salva as alterações
  const onSubmit = async (data) => {
    setSalvando(true);
    setMensagem('');
    setErro('');

    try {
      const resposta = await api.request('/api/profissional/perfil', {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      setMensagem(resposta.mensagem || 'Perfil atualizado com sucesso!');
      
      // Esconde a mensagem de sucesso após 3 segundos
      setTimeout(() => setMensagem(''), 3000);
    } catch (error) {
      setErro(error.message || 'Erro ao atualizar perfil.');
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--zlora-text-soft)' }}>
        Carregando perfil...
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Meu Perfil</h2>
          <p style={{ color: 'var(--zlora-text-soft)', margin: 0 }}>
            Gerencie suas informações profissionais.
          </p>
        </div>
      </div>

      <div className="dash-card" style={{ padding: '32px', maxWidth: '800px' }}>
        
        {/* CABEÇALHO DO CARD */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'var(--zlora-primary-soft)', color: 'var(--zlora-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px'
          }}>
            <FiUser />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Dados Profissionais</h3>
            <p style={{ margin: '4px 0 0', color: 'var(--zlora-text-soft)', fontSize: '14px' }}>
              Atualize seus dados de contato e especialidade.
            </p>
          </div>
        </div>

        {/* MENSAGENS DE SUCESSO / ERRO */}
        {mensagem && (
          <div className="alert alert-info" style={{ background: '#DCFCE7', color: '#166534', borderLeftColor: '#22C55E', marginBottom: '24px' }}>
            {mensagem}
          </div>
        )}
        {erro && (
          <div className="alert alert-info" style={{ background: '#FEE2E2', color: '#991B1B', borderLeftColor: '#DC2626', marginBottom: '24px' }}>
            {erro}
          </div>
        )}

        {/* FORMULÁRIO */}
        <form onSubmit={handleSubmit(onSubmit)}>
          
          <div className="form-group">
            <label htmlFor="nome"><FiUser style={{ marginBottom: '-2px' }} /> Nome Completo *</label>
            <input
              id="nome"
              className={`form-control ${errors.nome ? 'is-invalid' : ''}`}
              {...register('nome')}
            />
            {errors.nome && <small className="form-error is-visible">{errors.nome.message}</small>}
          </div>

          <div className="form-group">
            <label htmlFor="email"><FiMail style={{ marginBottom: '-2px' }} /> E-mail de Acesso</label>
            <input
              id="email"
              type="email"
              className="form-control"
              value={email}
              disabled
              style={{ background: '#F3F4F6', cursor: 'not-allowed' }}
            />
            <small className="form-hint">O e-mail de login não pode ser alterado por esta tela.</small>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="telefone"><FiPhone style={{ marginBottom: '-2px' }} /> Telefone</label>
                <input
                  id="telefone"
                  className="form-control"
                  placeholder="(00) 00000-0000"
                  {...register('telefone')}
                />
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="especialidade"><FiScissors style={{ marginBottom: '-2px' }} /> Especialidade</label>
                <input
                  id="especialidade"
                  className="form-control"
                  placeholder="Ex: Barbeiro, Manicure..."
                  {...register('especialidade')}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--zlora-border)' }}>
            <button type="submit" className="btn btn-primary" disabled={salvando}>
              <FiSave style={{ marginRight: '8px', marginBottom: '-2px' }} />
              {salvando ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}