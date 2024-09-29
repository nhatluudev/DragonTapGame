// Imports
import { createContext, useState, useContext, useEffect } from 'react';

// Utils
import { apiUtils } from '../../utils/newRequest';

// Create the context
export const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(null); // Loading state

    // Function to create or fetch user from the server
    const initializeUser = async (telegramId, firstName, lastName) => {
        try {
            const url = `/users/createOrFetchUser`;
            console.log(telegramId, firstName, lastName)
            const response = await apiUtils.post(url, { telegramId, firstName, lastName });
            console.log(response.data.userInfo);
            setUserInfo(response.data.userInfo); // Store the user info
        } catch (error) {
            console.error("Error initializing user:", error);
        }
    };

    useEffect(() => {
        setIsLoading(true); // Set loading to true when initialization starts

        const initializeTelegram = () => {
            console.log(window.Telegram.WebApp.initDataUnsafe.user)
            if (window.Telegram && window.Telegram.WebApp) {
                // window.Telegram.WebApp.onEvent('ready', () => {
                // const { id: telegramId, first_name: firstName, last_name: lastName } = window.Telegram.WebApp.initDataUnsafe.user || {};
                const {telegramId, firstName, lastName} = {"telegramId": "123", "firstName": "Hao", "lastName": "Truong"};
                console.log(telegramId, firstName, lastName)
                if (telegramId) {
                    console.log("RUN THISS")
                    initializeUser(telegramId, firstName, lastName);
                } else {
                    console.error("Telegram user information is not available.");
                }
                // });

                setIsLoading(false); // Set loading to false after initialization
            } else {
                console.error("Telegram WebApp is not available. Running in a normal browser environment.");
                setIsLoading(false); // Stop loading if not inside Telegram WebApp
            }
        };

        initializeTelegram();
    }, []);

    const value = { userInfo, setUserInfo };

    if (isLoading) {
        return <span>Đang tải...</span>;
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
