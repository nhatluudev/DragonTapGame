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
    const [isLoading, setIsLoading] = useState(true); // Loading state

    // Function to create or fetch user from the server
    const initializeUser = async (telegramId, firstName, lastName) => {
        try {
            const url = `/users/createOrFetchUser`;
            const response = await apiUtils.post(url, { telegramId, firstName, lastName });
            console.log(response.data.userInfo);
            setUserInfo(response.data.userInfo); // Store the user info
        } catch (error) {
            console.error("Error initializing user:", error);
        }
    };

    useEffect(() => {
        const telegramId = "333333";  // Example telegramId, replace it as per actual context
        const firstName = "Json";
        const lastName = "Format";

        initializeUser(telegramId, firstName, lastName);

        setIsLoading(false); // Set loading to false after initialization
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