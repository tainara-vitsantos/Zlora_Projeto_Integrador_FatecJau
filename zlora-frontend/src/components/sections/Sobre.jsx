import { IoIosCalendar, IoIosHappy, IoIosCheckmarkCircle } from 'react-icons/io';
import { FaChartBar, FaLaptop, FaMobileAlt } from 'react-icons/fa';
import { FiBell, FiCheckCircle } from 'react-icons/fi';
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

        {/* MÓDULO 1 - WEBADMIN (Focado em Gestão e Relatórios) */}
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
                <div className="mockup-content" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#fff' }}>
                  
                  {/* Header do Dashboard */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                    <strong style={{ fontSize: '0.9rem', color: '#333' }}>Visão Geral</strong>
                    <span style={{ fontSize: '0.7rem', background: '#f3e8ff', color: '#7e22ce', padding: '2px 8px', borderRadius: '12px' }}>Hoje</span>
                  </div>

                  {/* Gráfico Fake (Relatórios Financeiros) */}
                  <div className="mockup-chart" style={{ height: '90px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-end', padding: '0.5rem 1rem', gap: '8px' }}>
                    <div style={{ height: '40%', flex: 1, background: '#c084fc', borderRadius: '4px 4px 0 0' }}></div>
                    <div style={{ height: '70%', flex: 1, background: '#a855f7', borderRadius: '4px 4px 0 0' }}></div>
                    <div style={{ height: '30%', flex: 1, background: '#c084fc', borderRadius: '4px 4px 0 0' }}></div>
                    <div style={{ height: '85%', flex: 1, background: '#a855f7', borderRadius: '4px 4px 0 0' }}></div>
                    <div style={{ height: '50%', flex: 1, background: '#c084fc', borderRadius: '4px 4px 0 0' }}></div>
                    <div style={{ height: '95%', flex: 1, background: '#7e22ce', borderRadius: '4px 4px 0 0' }}></div>
                  </div>

                  {/* Cards de Resumo (Comissões e Estoque) */}
                  <div className="mockup-cards" style={{ display: 'flex', gap: '1rem' }}>
                    <div className="m-card" style={{ flex: 1, padding: '0.8rem', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                      <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Comissões (Mês)</span>
                      <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>R$ 4.250,00</strong>
                    </div>
                    <div className="m-card" style={{ flex: 1, padding: '0.8rem', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                      <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Estoque Baixo</span>
                      <strong style={{ fontSize: '1.1rem', color: '#ef4444' }}>3 alertas</strong>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MÓDULO 2 - APLICATIVO (Focado no Cliente) */}
        <div className="sobre-grid">
          <div className="sobre-visual-block">
            <div className="mockup-phone">
              <div className="phone-notch"></div>
              <div className="phone-screen" style={{ padding: '2.5rem 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8fafc' }}>
                
                {/* Header do App */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '1rem', color: '#333' }}>Olá, Maria 👋</strong>
                  <div style={{ position: 'relative', color: '#a855f7' }}>
                    <FiBell size={20} />
                    <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: '#ef4444', borderRadius: '50%' }}></span>
                  </div>
                </div>

                {/* Promoção / Fidelidade */}
                <div style={{ padding: '0.8rem', background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)', borderRadius: '12px', border: '1px solid #d8b4fe' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#7e22ce' }}>🎁 Promoção Exclusiva</div>
                    <div style={{ fontSize: '0.7rem', color: '#6b21a8', marginTop: '4px' }}>Ganhe 10% off no seu próximo corte!</div>
                </div>

                {/* Agendamentos do Cliente */}
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#333', marginBottom: '0.8rem' }}>Meus Agendamentos</div>
                  
                  <div className="calendar-event active" style={{ padding: '0.8rem', marginBottom: '0.5rem', background: '#fff', border: '1px solid #d8b4fe', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                    <div className="event-time" style={{ fontSize: '0.8rem', color: '#7e22ce', fontWeight: 'bold', minWidth: '40px' }}>09:00</div>
                    <div className="event-info">
                      <strong style={{ fontSize: '0.85rem', display: 'block', color: '#333' }}>Corte de Cabelo</strong>
                      <span style={{ fontSize: '0.7rem', color: '#666' }}>com João Silva</span>
                    </div>
                    <FiCheckCircle style={{ marginLeft: 'auto', color: '#a855f7' }} size={16}/>
                  </div>

                  <div className="calendar-event" style={{ padding: '0.8rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                     <div className="event-time" style={{ fontSize: '0.8rem', color: '#666', minWidth: '40px' }}>10:30</div>
                     <div className="event-info">
                       <strong style={{ fontSize: '0.85rem', display: 'block', color: '#333' }}>Manicure</strong>
                       <span style={{ fontSize: '0.7rem', color: '#666' }}>com Maria Souza</span>
                     </div>
                  </div>
                </div>

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