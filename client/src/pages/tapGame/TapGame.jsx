import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from '../../contexts/auth/AuthContext.jsx';
import { apiUtils } from '../../utils/newRequest';

// Styling and assets...
import T2CapitalIcon from "../../assets/img/t2-capital.png";
import DragonIcon from "../../assets/img/dragon.png";
import TokenIcon from "../../assets/img/token.png";
import EnergyIcon from "../../assets/img/energy.png";
import HandIcon from "../../assets/img/hand.png";
import UserAvatar1 from "../../assets/img/user-avatar-1.png";
import "./TapGame.scss";
import { formatFloat } from '../../utils/formatter.js';

const TapGame = () => {
    // Destructure userInfo from useAuth
    const { userInfo, setUserInfo } = useAuth();

    // Destructure properties from userInfo safely
    const {
        firstName = 'Guest', // Fallback to 'Guest' if firstName is not available
        lastName = '',
        telegramId = '',
        tokens = 0
    } = userInfo || {}; // Handle the case where userInfo might be null

    const [userTokens, setUserTokens] = useState(tokens); // Local state for tokens
    const [energyCount, setEnergyCount] = useState(500);
    const maxEnergy = 500; // Max energy limit
    const [tapQueue, setTapQueue] = useState([]); // To store tap requests
    const [isProcessing, setIsProcessing] = useState(false); // Processing state
    const [incrementAnimations, setIncrementAnimations] = useState([]); // Track +1 animations

    useEffect(() => {
        setUserTokens(tokens); // Sync with context when it changes
    }, [tokens]);

    useEffect(() => {
        // Energy regeneration logic
        const energyRegenInterval = setInterval(() => {
            setEnergyCount(prevEnergy => (prevEnergy < maxEnergy ? prevEnergy + 1 : prevEnergy));
        }, 900); // Regenerate 1 energy every 0.9 second

        return () => clearInterval(energyRegenInterval);
    }, []);



    const processTap = async () => {
        if (tapQueue.length === 0 || isProcessing || energyCount <= 0) return;

        setIsProcessing(true); // Mark as processing

        const currentTap = tapQueue[0]; // Get the first tap in the queue

        try {
            // Call the tap API to register the tap in the backend
            await apiUtils.post("/taps/tap", {
                telegramId: currentTap.telegramId,
                firstName: currentTap.firstName,
                lastName: currentTap.lastName,
            });

            console.log("Tap request processed successfully");

        } catch (error) {
            console.error("Error during tap processing:", error);
        } finally {
            // Remove the processed tap from the queue
            setTapQueue(prevQueue => prevQueue.slice(1));
            setIsProcessing(false); // Mark processing as complete
        }
    };

    // useEffect(() => {
    //     if (tapQueue.length > 0 && !isProcessing) {
    //         processTap();
    //     }
    // }, [tapQueue, isProcessing]);

    useEffect(() => {
        return () => {
            // Process any remaining taps before unmount
            while (tapQueue.length > 0) {
                processTap();
            }
        };
    }, [tapQueue, isProcessing]);


    // Function to handle tapping
    const [accumulatedTaps, setAccumulatedTaps] = useState(0); // Accumulated taps

    const handleTap = () => {
        if (energyCount > 0) {
            // Increase accumulated taps by 1
            setAccumulatedTaps(prevTaps => prevTaps + 1);

            // Optimistically increase tokens immediately for better UX
            setUserTokens(prevTokens => prevTokens + 1);

            // Add a +1 animation
            setIncrementAnimations(prev => [...prev, '+1']);

            // Decrease energy count
            setEnergyCount(prevEnergy => prevEnergy - 1);

            // Create the star pop effect
            const tapArea = document.querySelector('.tap-game__main__tapping');
            const starContainer = document.createElement('div');
            starContainer.className = 'star-container';

            const bigStar = document.createElement('div');
            bigStar.className = 'star big-star';

            const mediumStar = document.createElement('div');
            const smallStar = document.createElement('div');
            mediumStar.className = 'star medium-star';
            smallStar.className = 'star small-star';

            starContainer.appendChild(bigStar);
            starContainer.appendChild(mediumStar);
            starContainer.appendChild(smallStar);

            tapArea.appendChild(starContainer);

            // Remove the stars after the animation ends
            setTimeout(() => {
                tapArea.removeChild(starContainer);
            }, 1500);
        }
    };

    useEffect(() => {
        let batchTimeout;

        if (accumulatedTaps > 0) {
            // Set a timeout to send the batch to the server after 1 second of inactivity
            batchTimeout = setTimeout(async () => {
                try {
                    // Send the accumulated taps to the backend in one request
                    await apiUtils.post("/taps/tap", {
                        telegramId,
                        firstName,
                        lastName,
                        tapCount: accumulatedTaps, // Send the total accumulated taps
                    });

                    console.log(`Successfully processed ${accumulatedTaps} taps`);
                } catch (error) {
                    console.error("Error during batch tap processing:", error);
                } finally {
                    // Reset the accumulated taps after processing
                    setAccumulatedTaps(0);
                    setUserInfo({ ...userInfo, tokens: userInfo.tokens + accumulatedTaps })
                }
            }, 300); // 1 second delay to batch taps
        }

        return () => clearTimeout(batchTimeout); // Clean up timeout if the user taps again before it triggers
    }, [accumulatedTaps, telegramId, firstName, lastName]);

    useEffect(() => {
        if (incrementAnimations.length > 0) {
            // Remove each animation after 1 second
            const timer = setTimeout(() => {
                setIncrementAnimations(prev => prev.slice(1));
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [incrementAnimations]);

    return (
        <div className='tap-game'>
            <section className="header flex-justify-space-between mb-20">
                <div className='user'>
                    <img className='user-avatar mr-8' src={UserAvatar1} alt="Avatar" />
                    <div className="user-name">
                        <div>
                            <strong className="user-name__title">{firstName} {lastName}</strong>
                        </div>
                        <div className="user-name__sub-title">Thành viên mới</div>
                    </div>
                </div>
                <button className="btn btn-sm btn-4">
                    <img src={T2CapitalIcon} className="token-ic sm mr-8" alt="" />
                    <span className='fs-12'>
                        Join T2Capital
                    </span>
                </button>
            </section>

            <section className="tap-game__main">
                <div>
                    <h1 className="flex-align-center flex-justify-center">
                        <img src={TokenIcon} alt="" className="token-ic lg mr-8" />
                        {formatFloat(userTokens)}
                        <div className="tokens-container">
                            {incrementAnimations.map((anim, index) => (
                                <span key={index} className="token-increment">+1</span>
                            ))}
                        </div>
                    </h1>
                    <p className="annotation">
                        Tham gia cộng đồng T2Capital và thực hiện nhiệm vụ để nhận thưởng nhiều token hơn
                    </p>
                </div>

                <div className="tap-game__main__tapping" onClick={handleTap}>
                    <img className='tap-game__main__dragon' src={DragonIcon} alt="" />
                </div>

                <div className="flex-align-center flex-justify-space-between tap-game__main__extra">
                    <div className="flex-direction-column">
                        <img src={EnergyIcon} alt="" />
                        <span className={energyCount < 100 ? "highlight-red" : ""}>{energyCount}</span>/{maxEnergy}
                    </div>
                    <div className="flex-direction-column">
                        <img src={HandIcon} alt="" />
                        +1/Tap
                    </div>
                </div>
            </section>
        </div>
    );
};

export default TapGame;