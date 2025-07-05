import React from 'react';
import ReactDOM from 'react-dom/client';
import TelegramLogin from '../../src/components/Auth/telegram-login';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <TelegramLogin />
  </React.StrictMode>
);
