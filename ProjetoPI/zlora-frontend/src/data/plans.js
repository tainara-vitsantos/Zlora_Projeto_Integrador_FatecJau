const FEATURES_BASE = [
  'Agenda online 24/7',
  'Cadastro de clientes ilimitado',
  'App para profissional e cliente',
  'Lembretes automáticos',
];

export const PLANS = {
  anual: [
    {
      range: '1', label: '1 profissional', monthly: '55,90', old: '79,90',
      total: '670,80', popular: false,
      features: FEATURES_BASE,
    },
    {
      range: '2-5', label: '2 a 5 profissionais', monthly: '76,90', old: '109,90',
      total: '922,80', popular: true,
      features: [...FEATURES_BASE, 'Controle de comissões', 'Relatórios gerenciais'],
    },
    {
      range: '6-15', label: '6 a 15 profissionais', monthly: '115,15', old: '164,50',
      total: '1.381,80', popular: false,
      features: [...FEATURES_BASE, 'Controle de comissões', 'Relatórios gerenciais', 'Gestão de estoque'],
    },
    {
      range: '15+', label: '+15 profissionais', monthly: '153,90', old: '219,90',
      total: '1.846,80', popular: false,
      features: [...FEATURES_BASE, 'Controle de comissões', 'Relatórios gerenciais', 'Gestão de estoque', 'Suporte prioritário'],
    },
  ],
  semestral: [
    { range: '1',    label: '1 profissional',        monthly: '67,80',  old: '79,90',  total: '406,80',   popular: false, features: FEATURES_BASE },
    { range: '2-5',  label: '2 a 5 profissionais',   monthly: '93,30',  old: '109,90', total: '559,80',   popular: true,  features: [...FEATURES_BASE, 'Controle de comissões', 'Relatórios gerenciais'] },
    { range: '6-15', label: '6 a 15 profissionais',  monthly: '139,80', old: '164,50', total: '838,80',   popular: false, features: [...FEATURES_BASE, 'Controle de comissões', 'Relatórios gerenciais', 'Gestão de estoque'] },
    { range: '15+',  label: '+15 profissionais',     monthly: '186,80', old: '219,90', total: '1.120,80', popular: false, features: [...FEATURES_BASE, 'Controle de comissões', 'Relatórios gerenciais', 'Gestão de estoque', 'Suporte prioritário'] },
  ],
  mensal: [
    { range: '1',    label: '1 profissional',        monthly: '79,90',  popular: false, features: FEATURES_BASE },
    { range: '2-5',  label: '2 a 5 profissionais',   monthly: '109,90', popular: true,  features: [...FEATURES_BASE, 'Controle de comissões', 'Relatórios gerenciais'] },
    { range: '6-15', label: '6 a 15 profissionais',  monthly: '164,50', popular: false, features: [...FEATURES_BASE, 'Controle de comissões', 'Relatórios gerenciais', 'Gestão de estoque'] },
    { range: '15+',  label: '+15 profissionais',     monthly: '219,90', popular: false, features: [...FEATURES_BASE, 'Controle de comissões', 'Relatórios gerenciais', 'Gestão de estoque', 'Suporte prioritário'] },
  ],
};