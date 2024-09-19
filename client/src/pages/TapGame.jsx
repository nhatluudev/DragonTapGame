// import React, { useState, useEffect } from 'react';

// const TapGame = () => {
//     const { first_name, last_name, username } = window.Telegram.WebApp.initDataUnsafe.user;

//     //   const [tapCount, setTapCount] = useState(0);
//     //   const [telegramId, setTelegramId] = useState(null);
//     //   const [username, setUsername] = useState('Guest');

//     //   useEffect(() => {
//     //     // Check if Telegram WebApp context is available
//     //     if (window.Telegram.WebApp) {
//     //       const user = window.Telegram.WebApp.initDataUnsafe.user;
//     //       if (user) {
//     //         setTelegramId(user.id);
//     //         setUsername(user.username || 'Guest');
//     //       }
//     //     }
//     //   }, []);

//     //   const handleTap = async () => {
//     //     try {
//     //       const response = await fetch(`https://dragontapgame.onrender.com/api/taps/tap`, {
//     //         method: 'POST',
//     //         headers: { 'Content-Type': 'application/json' },
//     //         body: JSON.stringify({ telegramId }),
//     //       });
//     //       const data = await response.json();
//     //       setTapCount(data.tapCount);
//     //     } catch (error) {
//     //       console.error('Error:', error);
//     //     }
//     //   };

//     //   if (!telegramId) {
//     //     return <p>Loading...</p>;
//     //   }

//     return (
//         <div>
//             <h1>Hello </h1>
//             <h2>{first_name}</h2>
//             <h2>{last_name}</h2>
//             <h2>{username}</h2>
//             {/* <h1>Hello, {username}</h1>
//       <p>Current Tap Count: {tapCount}</p>
//       <button onClick={handleTap}>Tap!</button> */}
//         </div>
//     );
// };

// export default TapGame;


import React, { useState, useEffect } from 'react';

const TapGame = () => {
    const [firstName, setFirstName] = useState('Guest');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');

    useEffect(() => {
        // Check if Telegram WebApp context is available
        if (window.Telegram && window.Telegram.WebApp) {
            const user = window.Telegram.WebApp.initDataUnsafe.user;
            if (user) {
                setFirstName(user.first_name || 'Guest');
                setLastName(user.last_name || '');
                setUsername(user.username || 'Guest');
            }
        } else {
            alert('Telegram WebApp not initialized');
        }
    }, []);

    return (
        <div>
            <h1>Hello</h1>
            <h2>{firstName}</h2>
            <h2>{lastName}</h2>
            <h2>{username}</h2>
        </div>
    );
};

export default TapGame;
