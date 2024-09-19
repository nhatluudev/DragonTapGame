import React from 'react';
import TapApp from './pages/TapGame';

const App = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const telegramId = urlParams.get('telegramId');
  const username = urlParams.get('username');
  alert("abc");

  return <TapApp telegramId={telegramId} username={username} />;
};

export default App;
