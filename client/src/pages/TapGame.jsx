import React, { useState, useEffect } from 'react';

const TapGame = () => {
    const [firstName, setFirstName] = useState('Guest');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('Guest');
    const [tapCount, setTapCount] = useState(0); // Track tap count
    const [telegramId, setTelegramId] = useState(null);

    useEffect(() => {
        console.log('Checking Telegram WebApp Context:');
        console.log(window.Telegram); // Check if Telegram object exists

        // Fetch user data from Telegram WebApp context
        if (window.Telegram && window.Telegram.WebApp) {
            console.log('Telegram WebApp context is available');
            const user = window.Telegram.WebApp.initDataUnsafe.user;

            if (user) {
                setFirstName(user.first_name || 'Guest');
                setLastName(user.last_name || '');
                setUsername(user.username || 'Guest');
                setTelegramId(user.id); // Store the telegram ID
            }
        } else {
            alert('Telegram WebApp not initialized');
            console.log('Telegram WebApp not initialized');
        }
    }, []);

    // Function to handle tapping and updating the tap count
    const handleTap = async () => {
        try {
            const response = await fetch(`https://dragontapgame.onrender.com/api/taps/tap`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegramId })
            });
            const data = await response.json();
            setTapCount(data.tapCount); // Update the tap count
        } catch (error) {
            console.error('Error:', error);
        }
    };

    if (!telegramId) {
        return <p>Loading...</p>; // Show loading until the telegramId is fetched
    }

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Hello, {firstName} {lastName}!</h1>
            <h2>Username: {username}</h2>
            <p>Your current tap count is: {tapCount}</p>

            <button 
                onClick={handleTap} 
                style={{
                    backgroundColor: '#0088cc', 
                    color: 'white', 
                    padding: '10px 20px', 
                    border: 'none', 
                    borderRadius: '5px', 
                    cursor: 'pointer', 
                    fontSize: '18px'
                }}
            >
                Tap!
            </button>
        </div>
    );
};

export default TapGame;