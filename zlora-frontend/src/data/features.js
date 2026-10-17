import { IoIosPeople, IoIosCalendar, IoIosClipboard, IoIosDocument } from 'react-icons/io';
import {
  FaUserTie,
  FaConciergeBell,
  FaClock,
  FaHandHoldingUsd,
  FaChartPie,
  FaSearch,
  FaLock,
  FaUsersCog,
  FaInfoCircle,
  FaStar,
  FaShieldAlt,
} from 'react-icons/fa';

export const FEATURES = [
  { code: 'RF01', title: 'Cadastro de Clientes',          icon: IoIosPeople },
  { code: 'RF02', title: 'Cadastro de Profissionais',     icon: FaUserTie },
  { code: 'RF03', title: 'Cadastro de Serviços',          icon: FaConciergeBell },
  { code: 'RF04', title: 'Gerenciamento de Agendamentos', icon: IoIosCalendar },
  { code: 'RF05', title: 'Controle de Horários',          icon: FaClock },
  { code: 'RF06', title: 'Histórico de Atendimentos',     icon: IoIosClipboard },
  { code: 'RF07', title: 'Controle de Comissões',         icon: FaHandHoldingUsd },
  { code: 'RF08', title: 'Dashboard',                     icon: FaChartPie },
  { code: 'RF09', title: 'Relatórios',                    icon: IoIosDocument },
  { code: 'RF10', title: 'Pesquisa e Filtros',            icon: FaSearch },
  { code: 'RF11', title: 'Autenticação',                  icon: FaLock },
  { code: 'RF12', title: 'Gerenciamento de Usuários',     icon: FaUsersCog },
  { code: 'RF13', title: 'Status dos Agendamentos',       icon: FaInfoCircle },
  { code: 'RF14', title: 'Serviços Mais Solicitados',     icon: FaStar },
  { code: 'RF15', title: 'Horários de Maior Demanda',     icon: FaClock },
  { code: 'RNF04, RNF06', title: 'Segurança e Privacidade', icon: FaShieldAlt },
];
