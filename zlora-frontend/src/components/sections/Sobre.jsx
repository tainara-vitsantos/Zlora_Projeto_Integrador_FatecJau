import { IoIosCalendar, IoIosHappy } from 'react-icons/io';
import { FaChartBar } from 'react-icons/fa';
import SectionTitle from '../ui/SectionTitle';

const OBJETIVOS = [
  {
    icon: IoIosCalendar,
    title: 'Otimizar seu tempo',
    text: 'Agenda inteligente que evita conflitos de horário e reduz faltas com lembretes automáticos.',
  },
  {
    icon: IoIosHappy,
    title: 'Fidelizar clientes',
    text: 'Programa de fidelidade, envio de promoções e mensagens de retorno que trazem o cliente de volta.',
  },
  {
    icon: FaChartBar,
    title: 'Aumentar o faturamento',
    text: 'Relatórios gerenciais, controle de comissões e visão clara do desempenho do seu negócio.',
  },
];

export default function Sobre() {
  return (
    <section className="section" id="sobre">
      <div className="container">
        <SectionTitle
          title="Sobre a"
          highlight="Zlora"
          subtitle="Uma plataforma completa para gestão do seu negócio de beleza"
        />

        <p className="sobre-lead">
          A Zlora é uma plataforma web completa para o gerenciamento de{' '}
          <strong>salões de beleza</strong>, <strong>barbearias</strong>,{' '}
          <strong>clínicas de estética</strong> e <strong>lash designers</strong>.
          Do agendamento ao relatório financeiro, tudo em um só lugar.
        </p>

        <ul className="modulos">
          <li className="webadmin">
            <b>Módulo WebAdmin</b>
            Faça toda a gestão do estabelecimento: profissionais, histórico de
            clientes, comissões, estoque e relatórios financeiros. Armazenado em
            nuvem com acesso seguro de qualquer lugar.
          </li>
          <li className="mobile">
            <b>Módulo Aplicativo</b>
            Disponível para profissionais (agenda e comissões) e clientes
            (agendamento, notificações e promoções), aproximando o
            estabelecimento do seu público.
          </li>
        </ul>

        <h3 className="objetivo-title">Nosso objetivo</h3>

        <div className="row">
          {OBJETIVOS.map(({ icon: Icon, title, text }) => (
            <div className="col-12 col-lg-4 mb-4" key={title}>
              <article className="card border-primary">
                <div className="card-body">
                  <span className="card-icon" aria-hidden="true">
                    <Icon />
                  </span>
                  <h4 className="card-title">{title}</h4>
                  <p className="card-text">{text}</p>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}