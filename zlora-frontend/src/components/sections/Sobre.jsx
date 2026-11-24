import { IoIosCalendar, IoIosHappy, IoIosCheckmarkCircle } from 'react-icons/io';
import { FaChartBar, FaLaptop, FaMobileAlt } from 'react-icons/fa';
import SectionTitle from '../ui/SectionTitle';

export default function Sobre() {
  return (
    <section className="section sobre-section" id="sobre">
      <div className="container">
        <SectionTitle
          title="Sobre o"
          highlight="Zilora"
          subtitle="Uma plataforma completa para gestão do seu negócio de beleza"
        />

        <p className="sobre-lead">
          O Zilora é uma plataforma web completa para o gerenciamento de{' '}
          <strong>salões de beleza</strong>, <strong>barbearias</strong>,{' '}
          <strong>clínicas de estética</strong> e <strong>lash designers</strong>.
          Do agendamento ao relatório financeiro, tudo em um só lugar.
        </p>

        {/* MÓDULO 1 */}
        <div className="sobre-grid">
          <div className="sobre-text-block">
            <span className="sobre-badge"><FaLaptop /> WebAdmin</span>
            <h3>Controle total na palma da sua mão</h3>
            <p>
              Faça toda a gestão do estabelecimento em uma interface intuitiva e poderosa. 
              Tenha uma visão macro do seu negócio e tome decisões baseadas em dados.
            </p>
            <ul className="sobre-list">
              <li><IoIosCheckmarkCircle /> Controle de comissões e metas</li>
              <li><IoIosCheckmarkCircle /> Histórico completo de clientes</li>
              <li><IoIosCheckmarkCircle /> Gestão de estoque de produtos</li>
              <li><IoIosCheckmarkCircle /> Relatórios financeiros em tempo real</li>
            </ul>
          </div>
          
          <div className="sobre-visual-block">
            <div className="mockup-browser">
              <div className="mockup-header">
                <span className="dot"></span><span className="dot"></span><span className="dot"></span>
              </div>
              <div className="mockup-body">
                <div className="mockup-sidebar"></div>
                <div className="mockup-content">
                  <div className="mockup-chart"></div>
                  <div className="mockup-cards">
                    <div className="m-card"></div>
                    <div className="m-card"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MÓDULO 2 (Invertido) */}
        <div className="sobre-grid">
          <div className="sobre-visual-block">
            <div className="mockup-phone">
              <div className="phone-notch"></div>
              <div className="phone-screen">
                <div className="phone-header"></div>
                <div className="phone-item"></div>
                <div className="phone-item active"></div>
                <div className="phone-item"></div>
              </div>
            </div>
          </div>

          <div className="sobre-text-block">
            <span className="sobre-badge"><FaMobileAlt /> Aplicativo</span>
            <h3>Seu salão no bolso do cliente</h3>
            <p>
              Acessível tanto para o profissional quanto para o cliente. 
              Aumente o engajamento e facilite a rotina com notificações e agendamentos online.
            </p>
            <ul className="sobre-list">
              <li><IoIosCheckmarkCircle /> Agendamento 24h por dia</li>
              <li><IoIosCheckmarkCircle /> Notificações de lembretes automáticos</li>
              <li><IoIosCheckmarkCircle /> Área exclusiva para o profissional</li>
              <li><IoIosCheckmarkCircle /> Envio de promoções e fidelidade</li>
            </ul>
          </div>
        </div>

        {/* OBJETIVOS */}
        <h3 className="objetivo-title">Nosso objetivo</h3>
        
        <div className="sobre-objetivos-grid">
          {[
            { icon: IoIosCalendar, title: 'Otimizar seu tempo', text: 'Agenda inteligente que evita conflitos e reduz faltas com lembretes automáticos.' },
            { icon: IoIosHappy, title: 'Fidelizar clientes', text: 'Programa de fidelidade, envio de promoções e mensagens que trazem o cliente de volta.' },
            { icon: FaChartBar, title: 'Aumentar o faturamento', text: 'Relatórios gerenciais, controle de comissões e visão clara do seu desempenho.' }
          ].map(({ icon: Icon, title, text }) => (
            <div className="sobre-objetivo-card" key={title}>
              <div className="sobre-objetivo-icon">
                <Icon />
              </div>
              <h4 className="sobre-objetivo-title">{title}</h4>
              <p className="sobre-objetivo-text">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}