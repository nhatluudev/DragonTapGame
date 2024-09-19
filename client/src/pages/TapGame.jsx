import React, { useState, useEffect } from 'react';

const TapGame = () => {
  const [tapCount, setTapCount] = useState(0);
  const [telegramId, setTelegramId] = useState(null);
  const [username, setUsername] = useState('Guest');

  useEffect(() => {
    // Check if Telegram WebApp context is available
    if (window.Telegram.WebApp) {
      const user = window.Telegram.WebApp.initDataUnsafe.user;
      if (user) {
        setTelegramId(user.id);
        setUsername(user.username || 'Guest');
      }
    }
  }, []);

  const handleTap = async () => {
    try {
      const response = await fetch(`https://dragontapgame.onrender.com/api/taps/tap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId }),
      });
      const data = await response.json();
      setTapCount(data.tapCount);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (!telegramId) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Hello, {username}</h1>
      <p>Current Tap Count: {tapCount}</p>
      <button onClick={handleTap}>Tap!</button>
    </div>
  );
};

export default TapGame;
