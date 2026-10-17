import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // <-- Importação nova
import App from './App';

import './styles/tokens.css';
import './styles/reset.css';
import './styles/grid.css';
import './styles/zlora.css';
import './styles/dashboard.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* <-- Envolvendo o App */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);