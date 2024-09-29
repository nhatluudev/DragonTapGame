import { useContext, useState, useEffect } from "react"
import { Link, Outlet } from "react-router-dom"
import { useAuth } from '../../contexts/auth/AuthContext.jsx';
import { convertUTCToLocalDateTime, formatFloat } from "../../utils/formatter.js";
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
import BotSignalIcon from "../../assets/img/bot.png";
import "./Mission.scss"
import { useModal } from "../../contexts/modal/ModalContext.jsx";
import { isDate } from "../../utils/validator.js";

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
            console.error("Error started login status:", error);
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

    const handleStartMission = async (missionType) => {
        console.log(missionType)
        // Proceed with the backend request to start the mission
        try {
            const response = await apiUtils.post('/users/startMission', { telegramId, missionType });
            console.log(response)

            if (response.data) {
                setUserInfo(response.data.user)
            }
        } catch (error) {
            console.error("Error starting the mission:", error);
        }
    };

    const handleCheckMission = async (missionType) => {
        // Proceed with the backend request to start the mission
        console.log(missionType)
        try {
            const response = await apiUtils.post('/users/checkMission', { telegramId, missionType });
            console.log(response)

            if (response.data) {
                setUserInfo(response.data.user)
            }
        } catch (error) {
            console.error("Error checking the mission:", error);
        }
    };

    const handleRewardMission = async (missionType) => {
        // Proceed with the backend request to start the mission
        console.log(missionType)
        try {
            const response = await apiUtils.post('/users/rewardMission', { telegramId, missionType });
            console.log(response)

            if (response.data) {
                setUserInfo(response.data.user)
            }
        } catch (error) {
            console.error("Error checking the mission:", error);
        }
    };

    // Helper to determine if the 'check' button should be shown based on last check time
    const shouldShowRewardButton = (lastCheckTime) => {
        if (!lastCheckTime) return false; // Ensure lastCheckTime exists

        // Convert lastCheckTime to local Vietnam time as a Date object
        const localLastCheckTime = convertUTCToLocalDateTime(lastCheckTime);

        if (!localLastCheckTime) return false; // Ensure the conversion was successful

        // 5 minutes in milliseconds
        const FIVE_MINUTES = 1 * 60 * 1000;

        // Get the current time in milliseconds
        const now = Date.now();

        // Calculate the difference in milliseconds
        const timeDifference = now - localLastCheckTime.getTime(); // Subtract the timestamps

        console.log(timeDifference)

        // Return true if more than 5 minutes have passed
        return timeDifference > FIVE_MINUTES;
    };

    // Show a loading spinner or message while data is being fetched
    if (isLoading) {
        return (
            <div className="loading">
                <div className="loading-spinner"></div>
                <h3>Đang tải ...</h3>
            </div>
        )
    }

    const currentDate = new Date();
    const pastDate = new Date("2024-09-29T09:41:35+07:00");
    const differenceInMilliseconds = currentDate - pastDate;
    console.log(differenceInMilliseconds / (1000 * 60 * 60))

    return (
        <div className="mission">
            <section className="header flex-justify-center flex-align-center mb-20">
                <img src={TokenIcon} alt="" className="token-ic lg mr-8" />
                <h2>{formatFloat(userTokens)}</h2>
            </section>

            <section className="mission__daily mb-24">
                <h3 className="section__title">
                    <img src={GoalIcon} className="section__ic" alt="" />
                    Nhiệm vụ nhận thưởng

                    {/* {new Date().toLocaleString() - new Date("2024-09-29T09:41:35+07:00")} */}
                </h3>

                <div className="mission-container">
                    <a href="https://t.me/FuturesSignalVipPro" target="_blank" rel="noopener noreferrer" className="mission-item" onClick={() => userInfo?.missions?.telegramReaction?.status == "pending" ? handleStartMission('telegramReaction') : null}>
                        <div className="mission-item--left">
                            <img src={TelegramIcon} alt="" className="mission-item__ic" />
                            <div>
                                <strong className="mission-item__title">Phản ứng bài viết mới nhất ở Telegram</strong>
                                <span className="mission-item__sub-title flex-align-center">
                                    <img src={TokenIcon} className="token-ic sm mr-4" />
                                    <strong>+1,000</strong>
                                </span>
                            </div>
                        </div>
                        <div className="mission-item--right">
                            {/* {userInfo.missions.telegramReaction.lastCheckTime} */}
                            {userInfo?.missions?.telegramReaction?.status === "pending" && (
                                <button className="btn btn-sm btn-4" onClick={() => handleStartMission('telegramReaction')}>
                                    Thực hiện
                                </button>
                            )}
                            {userInfo?.missions?.telegramReaction?.status === "started" && (
                                <button className="btn btn-sm btn-4" onClick={() => handleCheckMission('telegramReaction')}>
                                    Kiểm tra
                                </button>
                            )}
                            {userInfo?.missions?.telegramReaction?.status === "checked" && (
                                shouldShowRewardButton(userInfo?.missions?.telegramReaction?.lastCheckTime) ? (
                                    <button className="btn btn-sm btn-4" onClick={() => handleRewardMission('telegramReaction')}>
                                        Nhận thưởng
                                    </button>
                                ) : (
                                    <button className="btn btn-sm btn-4">
                                        Kiểm tra
                                    </button>
                                )
                            )}
                            {userInfo?.missions?.telegramReaction?.status === "rewarded" && (
                                <button className="btn btn-sm btn-5">
                                    Đã nhận
                                </button>
                            )}
                        </div>
                    </a>

                    <a href="https://www.facebook.com/groups/namiexchangeglobal" target="_blank" rel="noopener noreferrer" className="mission-item" onClick={() => userInfo?.missions?.facebookReaction?.status == "pending" ? handleStartMission('facebookReaction') : null}>
                        <div className="mission-item--left">
                            <img src={FacebookIcon} alt="" className="mission-item__ic" />
                            <div>
                                <strong className="mission-item__title">Phản ứng bài viết mới nhất ở Facebook</strong>
                                <span className="mission-item__sub-title flex-align-center">
                                    <img src={TokenIcon} className="token-ic sm mr-4" />
                                    <strong>+1,000</strong>
                                </span>
                            </div>
                        </div>
                        <div className="mission-item--right">
                            {/* {userInfo.missions.facebookReaction.lastCheckTime} */}
                            {userInfo?.missions?.facebookReaction?.status === "pending" && (
                                <button className="btn btn-sm btn-4" onClick={() => handleStartMission('facebookReaction')}>
                                    Thực hiện
                                </button>
                            )}
                            {userInfo?.missions?.facebookReaction?.status === "started" && (
                                <button className="btn btn-sm btn-4" onClick={() => handleCheckMission('facebookReaction')}>
                                    Kiểm tra
                                </button>
                            )}
                            {userInfo?.missions?.facebookReaction?.status === "checked" && (
                                shouldShowRewardButton(userInfo?.missions?.facebookReaction?.lastCheckTime) ? (
                                    <button className="btn btn-sm btn-4" onClick={() => handleRewardMission('facebookReaction')}>
                                        Nhận thưởng
                                    </button>
                                ) : (
                                    <button className="btn btn-sm btn-4">
                                        Kiểm tra
                                    </button>
                                )
                            )}
                            {userInfo?.missions?.facebookReaction?.status === "rewarded" && (
                                <button className="btn btn-sm btn-5">
                                    Đã nhận
                                </button>
                            )}
                        </div>
                    </a>


                    <a href="https://t.me/nami_signals" target="_blank" rel="noopener noreferrer" className="mission-item" onClick={() => userInfo?.missions?.joinTelegramGroup?.status == "pending" ? handleStartMission('joinTelegramGroup') : null}>
                        <div className="mission-item--left">
                            <img src={BotSignalIcon} alt="" className="mission-item__ic" />
                            <div>
                                <strong className="mission-item__title">Tham Gia vào nhóm Bot Signal</strong>
                                <span className="mission-item__sub-title flex-align-center">
                                    <img src={TokenIcon} className="token-ic sm mr-4" />
                                    <strong>+1,000</strong>
                                </span>
                            </div>
                        </div>
                        <div className="mission-item--right">
                            {/* {userInfo.missions.joinTelegramGroup.lastCheckTime} */}
                            {userInfo?.missions?.joinTelegramGroup?.status === "pending" && (
                                <button className="btn btn-sm btn-4" onClick={() => handleStartMission('joinTelegramGroup')}>
                                    Thực hiện
                                </button>
                            )}
                            {userInfo?.missions?.joinTelegramGroup?.status === "started" && (
                                <button className="btn btn-sm btn-4" onClick={() => handleCheckMission('joinTelegramGroup')}>
                                    Kiểm tra
                                </button>
                            )}
                            {userInfo?.missions?.joinTelegramGroup?.status === "checked" && (
                                shouldShowRewardButton(userInfo?.missions?.joinTelegramGroup?.lastCheckTime) ? (
                                    <button className="btn btn-sm btn-4" onClick={() => handleRewardMission('joinTelegramGroup')}>
                                        Nhận thưởng
                                    </button>
                                ) : (
                                    <button className="btn btn-sm btn-4">
                                        Kiểm tra
                                    </button>
                                )
                            )}
                            {userInfo?.missions?.joinTelegramGroup?.status === "rewarded" && (
                                <button className="btn btn-sm btn-5">
                                    Đã nhận
                                </button>
                            )}
                        </div>
                    </a>

                    <Link to="/missions/daily-login" className="mission-item">
                        <div className="mission-item--left">
                            <img src={CalendarIcon} alt="" className="mission-item__ic" />
                            <div>
                                <div>
                                    <strong className="mission-item__title">
                                        Điểm danh hằng ngày
                                    </strong>
                                </div>
                                <span className="mission-item__sub-title flex-align-center"><img src={TokenIcon} className="token-ic sm mr-4" />
                                    <strong>+5,000</strong>
                                </span>
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
                                    <img src={TokenIcon} className="token-ic sm mr-4" />
                                    <strong>+1,000</strong>
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
                    Thực hiện nhiệm vụ Rồng Xanh để nhận được những phần quà giá trị khi BXH được niêm yết
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
                                <span className="mission-item__sub-title flex-align-center"><img src={TokenIcon} className="token-ic sm mr-8" />
                                    <strong>+5,000</strong>
                                </span>
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
                                <span className="mission-item__sub-title flex-align-center"><img src={TokenIcon} className="token-ic sm mr-8" />
                                    <strong>+1,000</strong>
                                </span>
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
            <Outlet />
        </div>
    )
}