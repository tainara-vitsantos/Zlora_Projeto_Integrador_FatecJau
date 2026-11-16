
import { useEffect, useState } from 'react';
import { FiUser, FiMail, FiPhone, FiScissors, FiSave } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function MeuPerfil() {
  const [perfil, setPerfil] = useState({
    nome: '',
    email: '',
    telefone: '',
    especialidade: '',
  });

  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const token = localStorage.getItem('@Zlora:token');

  useEffect(() => {
    async function carregarPerfil() {
      try {
        const resposta = await fetch(`${API_URL}/api/profissional/perfil`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!resposta.ok) {
          throw new Error('Não foi possível carregar seu perfil.');
        }

        const dados = await resposta.json();
        setPerfil(dados);
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    }

    carregarPerfil();
  }, []);

  function atualizarCampo(event) {
    setPerfil({
      ...perfil,
      [event.target.name]: event.target.value,
    });
  }

  async function salvarPerfil(event) {
    event.preventDefault();
    setMensagem('');
    setErro('');
    setSalvando(true);

    try {
      const resposta = await fetch(`${API_URL}/api/profissional/perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome: perfil.nome,
          telefone: perfil.telefone,
          especialidade: perfil.especialidade,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.mensagem || 'Não foi possível atualizar o perfil.');
      }

      setMensagem(dados.mensagem);
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return <p style={{ color: 'var(--zlora-text-soft)' }}>Carregando perfil...</p>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
            Meu Perfil
          </h2>

          <p style={{ color: 'var(--zlora-text-soft)', margin: 0 }}>
            Gerencie suas informações profissionais.
          </p>
        </div>
      </div>

      <div className="dash-card" style={{ padding: '28px', maxWidth: '850px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '28px'
        }}>
          <div style={{
            width: '58px',
            height: '58px',
            borderRadius: '18px',
            background: 'var(--zlora-primary-light, #F0E9FF)',
            color: 'var(--zlora-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '25px'
          }}>
            <FiUser />
          </div>

          <div>
            <h3 style={{ margin: 0, fontSize: '18px' }}>
              Dados profissionais
            </h3>
            <p style={{
              margin: '5px 0 0',
              color: 'var(--zlora-text-soft)',
              fontSize: '13px'
            }}>
              Atualize seus dados de contato e especialidade.
            </p>
          </div>
        </div>

        {mensagem && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '10px',
            background: '#E8F8EF',
            color: '#21834A',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {mensagem}
          </div>
        )}

        {erro && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '10px',
            background: '#FDECEC',
            color: '#C0392B',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {erro}
          </div>
        )}

        <form onSubmit={salvarPerfil}>
          <div className="form-group">
            <label>
              <FiUser style={{ marginRight: '7px' }} />
              Nome completo
            </label>
            <input
              className="form-control"
              name="nome"
              value={perfil.nome}
              onChange={atualizarCampo}
              required
              maxLength={120}
            />
          </div>

          <div className="form-group">
            <label>
              <FiMail style={{ marginRight: '7px' }} />
              E-mail
            </label>
            <input
              className="form-control"
              type="email"
              value={perfil.email}
              disabled
            />
            <small className="form-hint">
              O e-mail de acesso não pode ser alterado por esta tela.
            </small>
          </div>

          <div className="form-group">
            <label>
              <FiPhone style={{ marginRight: '7px' }} />
              Telefone
            </label>
            <input
              className="form-control"
              name="telefone"
              value={perfil.telefone || ''}
              onChange={atualizarCampo}
            />
          </div>

          <div className="form-group">
            <label>
              <FiScissors style={{ marginRight: '7px' }} />
              Especialidade
            </label>
            <input
              className="form-control"
              name="especialidade"
              value={perfil.especialidade || ''}
              onChange={atualizarCampo}
              maxLength={120}
            />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '28px'
          }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={salvando}
            >
              <FiSave style={{ marginRight: '8px' }} />
              {salvando ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
