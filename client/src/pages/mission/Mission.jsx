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

    const [isCheckingMission, setIsCheckingMission] = useState({
        telegramReaction: false,
        telegramNamiReaction: false,
        facebookReaction: false,
        facebookFanpageReaction: false,
        joinTelegramGroup: false,
    });

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
            if (missionType == "joinTelegramGroup" && !userInfo.isInCommunity) {
                setModalInfo({
                    status: "error",
                    message: "Vui lòng gia nhập T2Capital và KYC tài khoản trước"
                })
                return;
            }
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
        // Set the loading state for the clicked mission before making the request
        setIsCheckingMission((prev) => ({ ...prev, [missionType]: true }));

        // Proceed with the backend request after a 4-second simulated delay
        setTimeout(async () => {
            try {
                const response = await apiUtils.post('/users/checkMission', { telegramId, missionType });
                if (response.data) {
                    setUserInfo(response.data.user);
                }
            } catch (error) {
                console.error("Error checking the mission:", error);
            } finally {
                // After the check is complete, reset the loading state to false
                setIsCheckingMission((prev) => ({ ...prev, [missionType]: false }));
            }
        }, 4000); // 4 seconds delay for the spinner effect
    };

    const handleRewardMission = async (missionType) => {
        // Proceed with the backend request to start the mission
        console.log(missionType)
        try {
            const response = await apiUtils.post('/users/rewardMission', { telegramId, missionType });
            console.log(response)

            if (response.data) {
                setUserInfo(response.data.user)
                setModalInfo({
                    status: "success",
                    message: "Nhận thưởng thành công"
                })
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
        const FIVE_MINUTES = 5 * 60 * 1000;

        // Get the current time in milliseconds
        const now = Date.now();

        // Calculate the difference in milliseconds
        const timeDifference = now - localLastCheckTime.getTime(); // Subtract the timestamps

        console.log(timeDifference)

        // Return true if more than 5 minutes have passed
        return timeDifference > FIVE_MINUTES;
    };

    const handleShare = () => {
        const telegramUrl = 'https://t.me/share/url?url=https://t.me/qt_tap_bot';
        window.open(telegramUrl, '_blank');
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
                <h2 className="section__title">
                    <img src={GoalIcon} className="section__ic" alt="" />
                    Nhiệm vụ hàng ngày
                </h2>

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
                                <span className="mission-item__sub-title flex-align-center"><img src={TokenIcon} className="token-ic sm mr-4" />
                                    <strong>+379,000</strong>
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

                    <a href="https://t.me/FuturesSignalVipPro" target="_blank" rel="noopener noreferrer" className="mission-item" onClick={(e) => userInfo?.missions?.telegramReaction?.status === "pending" ? handleStartMission('telegramReaction') : null}>
                        <div className="mission-item--left">
                            <img src={TelegramIcon} alt="" className="mission-item__ic" />
                            <div>
                                <strong className="mission-item__title">Phản ứng bài viết mới nhất ở Telegram T2Capital</strong>
                                <span className="mission-item__sub-title flex-align-center">
                                    <img src={TokenIcon} className="token-ic sm mr-4" />
                                    <strong>+2,500</strong>
                                </span>
                            </div>
                        </div>
                        <div className="mission-item--right">
                            {/* {userInfo.missions.telegramReaction.lastCheckTime} */}
                            {userInfo?.missions?.telegramReaction?.status === "pending" && (
                                <button className="btn btn-sm btn-4" onClick={(e) => { handleStartMission('telegramReaction'); }}>
                                    Thực hiện
                                </button>
                            )}
                            {userInfo?.missions?.telegramReaction?.status === "started" && (
                                <button className="btn btn-sm btn-4" onClick={(e) => { e.preventDefault(); handleCheckMission('telegramReaction'); }}>
                                    {isCheckingMission.telegramReaction ? (
                                        <div className="spinner-check-btn"></div> // Add a spinner here
                                    ) : (
                                        "Kiểm tra"
                                    )}
                                </button>
                            )}

                            {userInfo?.missions?.telegramReaction?.status === "checked" && (
                                shouldShowRewardButton(userInfo?.missions?.telegramReaction?.lastCheckTime) ? (
                                    <button className="btn btn-sm btn-4" onClick={(e) => { e.preventDefault(); handleRewardMission('telegramReaction'); }}>
                                        Nhận thưởng
                                    </button>
                                ) : (
                                    <button className="btn btn-sm btn-4" onClick={(e) => e.preventDefault()}>
                                        {isCheckingMission.telegramReaction ? (
                                            <div className="spinner-check-btn"></div> // Add a spinner here
                                        ) : (
                                            "Kiểm tra"
                                        )}
                                    </button>
                                )
                            )}
                            {userInfo?.missions?.telegramReaction?.status === "rewarded" && (
                                <button className="btn btn-sm btn-5" onClick={(e) => e.preventDefault()}>
                                    Đã nhận
                                </button>
                            )}
                        </div>
                    </a>

                    <a href="https://t.me/ThongbaotuNami" target="_blank" rel="noopener noreferrer" className="mission-item" onClick={() => userInfo?.missions?.telegramNamiReaction?.status == "pending" ? handleStartMission('telegramNamiReaction') : null}>
                        <div className="mission-item--left">
                            <img src={TelegramIcon} alt="" className="mission-item__ic" />
                            <div>
                                <strong className="mission-item__title">Phản ứng bài viết mới nhất ở Telegram Nami</strong>
                                <span className="mission-item__sub-title flex-align-center">
                                    <img src={TokenIcon} className="token-ic sm mr-4" />
                                    <strong>+2,500</strong>
                                </span>
                            </div>
                        </div>
                        <div className="mission-item--right">
                            {/* {userInfo.missions.telegramNamiReaction.lastCheckTime} */}
                            {userInfo?.missions?.telegramNamiReaction?.status === "pending" && (
                                <button className="btn btn-sm btn-4" onClick={(e) => { handleStartMission('telegramNamiReaction') }}>
                                    Thực hiện
                                </button>
                            )}
                            {userInfo?.missions?.telegramNamiReaction?.status === "started" && (
                                <button className="btn btn-sm btn-4" onClick={(e) => { e.preventDefault(); handleCheckMission('telegramNamiReaction') }}>
                                    {isCheckingMission.telegramNamiReaction ? (
                                        <div className="spinner-check-btn"></div> // Add a spinner here
                                    ) : (
                                        "Kiểm tra"
                                    )}
                                </button>
                            )}
                            {userInfo?.missions?.telegramNamiReaction?.status === "checked" && (
                                shouldShowRewardButton(userInfo?.missions?.telegramNamiReaction?.lastCheckTime) ? (
                                    <button className="btn btn-sm btn-4" onClick={(e) => { e.preventDefault(); handleRewardMission('telegramNamiReaction') }}>
                                        Nhận thưởng
                                    </button>
                                ) : (
                                    <button className="btn btn-sm btn-4" onClick={(e) => e.preventDefault()}>
                                        {isCheckingMission.telegramNamiReaction ? (
                                            <div className="spinner-check-btn"></div> // Add a spinner here
                                        ) : (
                                            "Kiểm tra"
                                        )}
                                    </button>
                                )
                            )}
                            {userInfo?.missions?.telegramNamiReaction?.status === "rewarded" && (
                                <button className="btn btn-sm btn-5" onClick={(e) => e.preventDefault()}>
                                    Đã nhận
                                </button>
                            )}
                        </div>
                    </a>

                    <a href="https://www.facebook.com/share/g/rfrPxcrH8WYbZwSi/?mibextid=K35XfP" target="_blank" rel="noopener noreferrer" className="mission-item" onClick={() => userInfo?.missions?.facebookReaction?.status == "pending" ? handleStartMission('facebookReaction') : null}>
                        <div className="mission-item--left">
                            <img src={FacebookIcon} alt="" className="mission-item__ic" />
                            <div>
                                <strong className="mission-item__title">Phản ứng bài viết mới nhất ở Facebook Nami</strong>
                                <span className="mission-item__sub-title flex-align-center">
                                    <img src={TokenIcon} className="token-ic sm mr-4" />
                                    <strong>+2,500</strong>
                                </span>
                            </div>
                        </div>
                        <div className="mission-item--right">
                            {/* {userInfo.missions.facebookReaction.lastCheckTime} */}
                            {userInfo?.missions?.facebookReaction?.status === "pending" && (
                                <button className="btn btn-sm btn-4" onClick={(e) => { handleStartMission('facebookReaction') }}>
                                    Thực hiện
                                </button>
                            )}
                            {userInfo?.missions?.facebookReaction?.status === "started" && (
                                <button className="btn btn-sm btn-4" onClick={(e) => { e.preventDefault(); handleCheckMission('facebookReaction') }}>
                                    {isCheckingMission.facebookReaction ? (
                                        <div className="spinner-check-btn"></div> // Add a spinner here
                                    ) : (
                                        "Kiểm tra"
                                    )}
                                </button>
                            )}
                            {userInfo?.missions?.facebookReaction?.status === "checked" && (
                                shouldShowRewardButton(userInfo?.missions?.facebookReaction?.lastCheckTime) ? (
                                    <button className="btn btn-sm btn-4" onClick={(e) => { e.preventDefault(); handleRewardMission('facebookReaction') }}>
                                        Nhận thưởng
                                    </button>
                                ) : (
                                    <button className="btn btn-sm btn-4" onClick={(e) => { e.preventDefault() }}>
                                        {isCheckingMission.facebookReaction ? (
                                            <div className="spinner-check-btn"></div> // Add a spinner here
                                        ) : (
                                            "Kiểm tra"
                                        )}
                                    </button>
                                )
                            )}
                            {userInfo?.missions?.facebookReaction?.status === "rewarded" && (
                                <button className="btn btn-sm btn-5" onClick={(e) => { e.preventDefault() }}>
                                    Đã nhận
                                </button>
                            )}
                        </div>
                    </a>

                    <a href="https://www.facebook.com/qtcrypto" target="_blank" rel="noopener noreferrer" className="mission-item" onClick={() => userInfo?.missions?.facebookFanpageReaction?.status == "pending" ? handleStartMission('facebookFanpageReaction') : null}>
                        <div className="mission-item--left">
                            <img src={FacebookIcon} alt="" className="mission-item__ic" />
                            <div>
                                <strong className="mission-item__title">Phản ứng bài viết mới nhất ở Fanpage Facebook</strong>
                                <span className="mission-item__sub-title flex-align-center">
                                    <img src={TokenIcon} className="token-ic sm mr-4" />
                                    <strong>+2,500</strong>
                                </span>
                            </div>
                        </div>
                        <div className="mission-item--right">
                            {/* {userInfo.missions.facebookFanpageReaction.lastCheckTime} */}
                            {userInfo?.missions?.facebookFanpageReaction?.status === "pending" && (
                                <button className="btn btn-sm btn-4" onClick={(e) => { handleStartMission('facebookFanpageReaction') }}>
                                    Thực hiện
                                </button>
                            )}
                            {userInfo?.missions?.facebookFanpageReaction?.status === "started" && (
                                <button className="btn btn-sm btn-4" onClick={(e) => { e.preventDefault(); handleCheckMission('facebookFanpageReaction') }}>
                                    {isCheckingMission.facebookFanpageReaction ? (
                                        <div className="spinner-check-btn"></div> // Add a spinner here
                                    ) : (
                                        "Kiểm tra"
                                    )}
                                </button>
                            )}
                            {userInfo?.missions?.facebookFanpageReaction?.status === "checked" && (
                                shouldShowRewardButton(userInfo?.missions?.facebookFanpageReaction?.lastCheckTime) ? (
                                    <button className="btn btn-sm btn-4" onClick={(e) => { e.preventDefault(); handleRewardMission('facebookFanpageReaction') }}>
                                        Nhận thưởng
                                    </button>
                                ) : (
                                    <button className="btn btn-sm btn-4" onClick={(e) => { e.preventDefault() }}>
                                        {isCheckingMission.facebookFanpageReaction ? (
                                            <div className="spinner-check-btn"></div> // Add a spinner here
                                        ) : (
                                            "Kiểm tra"
                                        )}
                                    </button>
                                )
                            )}
                            {userInfo?.missions?.facebookFanpageReaction?.status === "rewarded" && (
                                <button className="btn btn-sm btn-5" onClick={(e) => { e.preventDefault() }}>
                                    Đã nhận
                                </button>
                            )}
                        </div>
                    </a>

                    <a href="https://www.facebook.com/namifutures" target="_blank" rel="noopener noreferrer" className="mission-item" onClick={() => userInfo?.missions?.facebookNamiFanpageReaction?.status == "pending" ? handleStartMission('facebookNamiFanpageReaction') : null}>
                        <div className="mission-item--left">
                            <img src={FacebookIcon} alt="" className="mission-item__ic" />
                            <div>
                                <strong className="mission-item__title">Phản ứng bài viết mới nhất ở Fanpage Nami</strong>
                                <span className="mission-item__sub-title flex-align-center">
                                    <img src={TokenIcon} className="token-ic sm mr-4" />
                                    <strong>+2,500</strong>
                                </span>
                            </div>
                        </div>
                        <div className="mission-item--right">
                            {/* {userInfo.missions.facebookNamiFanpageReaction.lastCheckTime} */}
                            {userInfo?.missions?.facebookNamiFanpageReaction?.status === "pending" && (
                                <button className="btn btn-sm btn-4" onClick={(e) => { handleStartMission('facebookNamiFanpageReaction') }}>
                                    Thực hiện
                                </button>
                            )}
                            {userInfo?.missions?.facebookNamiFanpageReaction?.status === "started" && (
                                <button className="btn btn-sm btn-4" onClick={(e) => { e.preventDefault(); handleCheckMission('facebookNamiFanpageReaction') }}>
                                    {isCheckingMission.facebookNamiFanpageReaction ? (
                                        <div className="spinner-check-btn"></div> // Add a spinner here
                                    ) : (
                                        "Kiểm tra"
                                    )}
                                </button>
                            )}
                            {userInfo?.missions?.facebookNamiFanpageReaction?.status === "checked" && (
                                shouldShowRewardButton(userInfo?.missions?.facebookNamiFanpageReaction?.lastCheckTime) ? (
                                    <button className="btn btn-sm btn-4" onClick={(e) => { e.preventDefault(); handleRewardMission('facebookNamiFanpageReaction') }}>
                                        Nhận thưởng
                                    </button>
                                ) : (
                                    <button className="btn btn-sm btn-4" onClick={(e) => { e.preventDefault() }}>
                                        {isCheckingMission.facebookNamiFanpageReaction ? (
                                            <div className="spinner-check-btn"></div> // Add a spinner here
                                        ) : (
                                            "Kiểm tra"
                                        )}
                                    </button>
                                )
                            )}
                            {userInfo?.missions?.facebookNamiFanpageReaction?.status === "rewarded" && (
                                <button className="btn btn-sm btn-5" onClick={(e) => { e.preventDefault() }}>
                                    Đã nhận
                                </button>
                            )}
                        </div>
                    </a>
                </div>
            </section >

            <section className="mission__dragon mb-24">
                <h2 className="section__title">
                    <img src={DragonOnlyIcon} className="section__ic mr-4" alt="" />
                    Nhiệm vụ Rồng Xanh
                </h2>
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
                                    <strong>+20,000</strong>
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
                                    <strong>+100,000</strong>
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

                    <a href="https://t.me/nami_signals" target="_blank" rel="noopener noreferrer" className="mission-item" onClick={() => userInfo?.missions?.joinTelegramGroup?.status == "pending" ? handleStartMission('joinTelegramGroup') : null}>
                        <div className="mission-item--left">
                            <img src={BotSignalIcon} alt="" className="mission-item__ic" />
                            <div>
                                <strong className="mission-item__title">Tham Gia vào nhóm Bot Signal</strong>
                                <span className="mission-item__sub-title flex-align-center">
                                    <img src={TokenIcon} className="token-ic sm mr-4" />
                                    <strong>+20,000</strong>
                                </span>
                            </div>
                        </div>
                        <div className="mission-item--right">
                            {/* {userInfo.missions.joinTelegramGroup.lastCheckTime} */}
                            {userInfo?.missions?.joinTelegramGroup?.status === "pending" && (
                                <button className="btn btn-sm btn-4" onClick={(e) => { handleStartMission('joinTelegramGroup') }}>
                                    Thực hiện
                                </button>
                            )}
                            {userInfo?.missions?.joinTelegramGroup?.status === "started" && (
                                <button className="btn btn-sm btn-4" onClick={(e) => { e.preventDefault(); handleCheckMission('joinTelegramGroup') }}>
                                    {isCheckingMission.joinTelegramGroup ? (
                                        <div className="spinner-check-btn"></div> // Add a spinner here
                                    ) : (
                                        "Kiểm tra"
                                    )}
                                </button>
                            )}
                            {userInfo?.missions?.joinTelegramGroup?.status === "checked" && (
                                shouldShowRewardButton(userInfo?.missions?.joinTelegramGroup?.lastCheckTime) ? (
                                    <button className="btn btn-sm btn-4" onClick={(e) => { e.preventDefault(); handleRewardMission('joinTelegramGroup') }}>
                                        Nhận thưởng
                                    </button>
                                ) : (
                                    <button className="btn btn-sm btn-4" onClick={(e) => { e.preventDefault() }}>
                                        {isCheckingMission.joinTelegramGroup ? (
                                            <div className="spinner-check-btn"></div> // Add a spinner here
                                        ) : (
                                            "Kiểm tra"
                                        )}
                                    </button>
                                )
                            )}
                            {userInfo?.missions?.joinTelegramGroup?.status === "rewarded" && (
                                <button className="btn btn-sm btn-5" onClick={(e) => { e.preventDefault() }}>
                                    Đã nhận
                                </button>
                            )}
                        </div>
                    </a>

                    <button onClick={handleShare}>
                        Share with Telegram
                    </button>
                </div>
            </section>
            <Outlet />
        </div >
    )
}