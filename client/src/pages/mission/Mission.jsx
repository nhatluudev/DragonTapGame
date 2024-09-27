import { useContext, useState, useEffect } from "react"
import { Link, Outlet } from "react-router-dom"
import { useAuth } from '../../contexts/auth/AuthContext.jsx';
import { formatFloat } from "../../utils/formatter.js";
import { apiUtils } from "../../utils/newRequest.js";

// Styling
import NamiIcon from "../../assets/img/nami.png";
import NamiKycIcon from "../../assets/img/nami-kyc.png";
import DragonIcon from "../../assets/img/dragon.png";
import DragonOnlyIcon from "../../assets/img/dragon-only.png";
import GoalIcon from "../../assets/img/goal.png";
import TokenIcon from "../../assets/img/token.png";
import CalendarIcon from "../../assets/img/calendar.png";
import AttendanceIcon from "../../assets/img/attendance.png";
import TelegramIcon from "../../assets/img/telegram.png";
import FacebookIcon from "../../assets/img/facebook.png";
import "./Mission.scss"
import { useModal } from "../../contexts/modal/ModalContext.jsx";

export default function Mission() {
    const { userInfo, setUserInfo } = useAuth();
    const { setModalInfo } = useModal();
    const [checkInMessage, setCheckInMessage] = useState('');
    const [isTenMinuteCheckInLoading, setIsTenMinuteCheckInLoading] = useState(false);
    const [hasLoggedInToday, setHasLoggedInToday] = useState(false); // Tracks if the user already logged in
    const [isLoading, setIsLoading] = useState(true);

    // Destructure properties from userInfo safely
    const {
        firstName = 'Guest',
        lastName = '',
        telegramId = '',
        tokens = 0
    } = userInfo || {};

    const [canCheckIn, setCanCheckIn] = useState(true); // Track if user can check-in
    const [checkInCooldown, setCheckInCooldown] = useState(0); // Track remaining cooldown time

    // Initialize with tokens from userInfo, but handle if userInfo is initially null or not yet available
    const [userTokens, setUserTokens] = useState(userInfo?.tokens || 0);

    // Sync with context tokens when userInfo changes
    useEffect(() => {
        if (userInfo?.tokens) {
            setUserTokens(userInfo.tokens);
        }
    }, [userInfo]);




    useEffect(() => {
        // On page load, check the last check-in status from the server
        const checkTenMinCheckInStatus = async () => {
            try {
                console.log(telegramId)
                const response = await apiUtils.get(`/users/tenMinCheckInStatus/${telegramId}`);
                const { canCheckIn, remainingTime } = response.data;

                setCanCheckIn(canCheckIn); // Update button state
                setCheckInCooldown(remainingTime * 60); // Set cooldown (in seconds) if needed
            } catch (error) {
                console.error("Error fetching check-in status:", error);
            }
        };

        if (telegramId) {
            checkTenMinCheckInStatus();
        }
    }, [telegramId]);


    // Function to check if the user has already logged in today
    // Function to check the login status
    const checkLoginStatus = async () => {
        try {
            const response = await apiUtils.get(`/users/checkLoginStatus/${userInfo?.telegramId}`);
            setHasLoggedInToday(response.data.hasLoggedInToday);
        } catch (error) {
            console.error("Error checking login status:", error);
        }
    };

    // Function to check the check-in status
    const checkTenMinCheckInStatus = async () => {
        try {
            const response = await apiUtils.get(`/users/tenMinCheckInStatus/${telegramId}`);
            const { canCheckIn, remainingTime } = response.data;
            setCanCheckIn(canCheckIn); // Update check-in button state
            setCheckInCooldown(remainingTime * 60); // Set cooldown (in seconds)
        } catch (error) {
            console.error("Error fetching check-in status:", error);
        }
    };

    // Update loginStreak and streakRewards when userInfo becomes available
    useEffect(() => {
        if (userInfo) {
            checkLoginStatus();
        }
    }, [userInfo]);


    useEffect(() => {
        // If cooldown time is set, start a timeout to reset canCheckIn after 10 minutes
        if (checkInCooldown > 0) {
            const timeoutId = setTimeout(() => {
                setCanCheckIn(true);
                setCheckInCooldown(0);
            }, checkInCooldown * 10000); // Convert seconds to milliseconds

            return () => clearTimeout(timeoutId); // Cleanup
        }
    }, [checkInCooldown]);

    const handleTenMinCheckIn = async () => {
        setIsTenMinuteCheckInLoading(true);
        try {
            const response = await apiUtils.post('/users/tenMinCheckIn', { telegramId: userInfo?.telegramId });
            const userInfoAfterCheckIn = response.data.user;
            console.log(response.data);

            setModalInfo({
                status: "success",
                message: "Ghi danh thành công"
            });
            setUserInfo({ ...userInfo, ...userInfoAfterCheckIn });
            setUserTokens(userInfoAfterCheckIn.tokens);
            setCanCheckIn(false); // Disable check-in after success

            // Start cooldown period (10 minutes)
            setCheckInCooldown(10 * 60); // 10 minutes in seconds

        } catch (error) {
            setModalInfo({ status: "error", message: error.response.data.message });
            setCheckInMessage(error.response?.data?.message || 'Error occurred during check-in.');
            if (error.response?.status === 400) {
                setCanCheckIn(false);
                const remainingTime = error.response?.data?.remainingTime;
                if (remainingTime) {
                    setCheckInCooldown(remainingTime * 60); // Convert minutes to seconds
                }
            }
        } finally {
            setIsTenMinuteCheckInLoading(false);
        }
    };

    // Fetch all essential data before rendering
    useEffect(() => {
        const fetchEssentialData = async () => {
            if (telegramId) {
                await Promise.all([checkLoginStatus(), checkTenMinCheckInStatus()]);
                setIsLoading(false); // Set loading to false after data fetch is complete
            }
        };
        fetchEssentialData();
    }, [telegramId]);

    // Show a loading spinner or message while data is being fetched
    if (isLoading) {
        return (
            <div className="loading">
                <div className="loading-spinner"></div>
                <h3>Đang tải ...</h3>
            </div>
        )
    }

    return (
        <div className="mission">
            <section className="header flex-justify-center flex-align-center mb-20">
                <img src={TokenIcon} alt="" className="token-ic lg mr-8" />
                <h2>{formatFloat(userTokens)}</h2>
            </section>

            <section className="mission__daily mb-24">
                <h3 className="section__title">
                    <img src={GoalIcon} className="section__ic" alt="" />
                    Nhiệm vụ hằng ngày
                </h3>
                <p className="annotation">
                    Các nhiệm vụ sẽ được reset vào lúc 0:00 hằng ngày
                </p>

                <div className="mission-container">
                    <Link to="/missions/daily-login" className="mission-item">
                        <div className="mission-item--left">
                            <img src={CalendarIcon} alt="" className="mission-item__ic" />
                            <div>
                                <div>
                                    <strong className="mission-item__title">
                                        Điểm danh hằng ngày
                                    </strong>
                                </div>
                                <span className="mission-item__sub-title flex-align-center"><img src={TokenIcon} className="token-ic sm mr-4" /> +5,000</span>
                            </div>
                        </div>
                        <div className="mission-item--right">
                            <button className={`btn btn-sm ${!hasLoggedInToday ? 'btn-4' : 'btn-5'}`}>
                                {!hasLoggedInToday ? 'Thực hiện' : `Đã nhận`}
                            </button>
                        </div>
                    </Link>

                    <div className="mission-item" onClick={canCheckIn ? handleTenMinCheckIn : null}>
                        <div className="mission-item--left">
                            <img src={AttendanceIcon} alt="" className="mission-item__ic" />
                            <div>
                                <div>
                                    <strong className="mission-item__title">Ghi danh 10 phút 1 lần</strong>
                                </div>
                                <span className="mission-item__sub-title flex-align-center">
                                    <img src={TokenIcon} className="token-ic sm mr-4" /> +1,000
                                </span>
                            </div>
                        </div>
                        <div className="mission-item--right">
                            <button className={`btn btn-sm ${canCheckIn ? 'btn-4' : 'btn-5'}`} disabled={!canCheckIn}>
                                {canCheckIn ? 'Thực hiện' : `Đã nhận`}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mission__dragon mb-24">
                <h3 className="section__title">
                    <img src={DragonOnlyIcon} className="section__ic mr-4" alt="" />
                    Nhiệm vụ Rồng Xanh
                </h3>
                <p className="annotation">
                    Thực hiện nhiệm vụ để nhận lượng lớn token
                </p>

                <div className="mission-container">
                    <Link to="/missions/check-in-community" className="mission-item">
                        <div className="mission-item--left">
                            <img src={NamiIcon} alt="" className="mission-item__ic" />
                            <div>
                                <div>
                                    <strong className="mission-item__title">
                                        Download Nami app
                                    </strong>
                                </div>
                                <span className="mission-item__sub-title flex-align-center"><img src={TokenIcon} className="token-ic sm mr-8" /> +5,000</span>
                            </div>
                        </div>
                        <div className="mission-item--right">
                            <div className="mission-item--right">
                                {
                                    userInfo?.isInCommunity ? (
                                        <button className="btn btn-sm btn-5">Đã nhận</button>
                                    ) : (
                                        <button className="btn btn-sm btn-4">Thực hiện</button>
                                    )
                                }
                            </div>
                        </div>
                    </Link>

                    <Link to="/missions/check-kyc" className="mission-item">
                        <div className="mission-item--left">
                            <img src={NamiKycIcon} alt="" className="mission-item__ic" />
                            <div>
                                <div>
                                    <strong className="mission-item__title">
                                        Hoàn tất KYC tài khoản Nami
                                    </strong>
                                </div>
                                <span className="mission-item__sub-title flex-align-center"><img src={TokenIcon} className="token-ic sm mr-8" /> +1,000</span>
                            </div>
                        </div>
                        <div className="mission-item--right">
                            {
                                userInfo?.isKyc ? (
                                    <button className="btn btn-sm btn-5">Đã nhận</button>
                                ) : (
                                    <button className="btn btn-sm btn-4">Thực hiện</button>
                                )
                            }
                        </div>
                    </Link>
                </div>
            </section>

            <section className="mission__daily mb-24">
                <h3 className="section__title">
                    <img src={GoalIcon} className="section__ic" alt="" />
                    Nhiệm vụ cộng đồng
                </h3>
                <p className="annotation">
                    Các nhiệm vụ sẽ được reset vào lúc 0:00 hằng ngày
                </p>

                <div className="mission-container">
                    <Link to="/missions/daily-login" className="mission-item">
                        <div className="mission-item--left">
                            <img src={FacebookIcon} alt="" className="mission-item__ic" />
                            <div>
                                <div>
                                    <strong className="mission-item__title">
                                        Điểm danh hằng ngày
                                    </strong>
                                </div>
                                <span className="mission-item__sub-title flex-align-center"><img src={TokenIcon} className="token-ic sm mr-4" /> +5,000</span>
                            </div>
                        </div>
                        <div className="mission-item--right">
                            <button className={`btn btn-sm ${hasLoggedInToday ? 'btn-4' : 'btn-5'}`}>
                                {hasLoggedInToday ? 'Thực hiện' : `Đã nhận`}
                            </button>
                        </div>
                    </Link>

                    <div className="mission-item" onClick={canCheckIn ? handleTenMinCheckIn : null}>
                        <div className="mission-item--left">
                            <img src={TelegramIcon} alt="" className="mission-item__ic" />
                            <div>
                                <div>
                                    <strong className="mission-item__title">Ghi danh 10 phút 1 lần</strong>
                                </div>
                                <span className="mission-item__sub-title flex-align-center">
                                    <img src={TokenIcon} className="token-ic sm mr-4" /> +1,000
                                </span>
                            </div>
                        </div>
                        <div className="mission-item--right">
                            <button className={`btn btn-sm ${canCheckIn ? 'btn-4' : 'btn-5'}`} disabled={!canCheckIn}>
                                {canCheckIn ? 'Thực hiện' : `Đã nhận`}
                            </button>
                        </div>
                    </div>
                </div>
            </section>
            <Outlet />
        </div>
    )
}