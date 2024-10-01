import { useContext, useState, useEffect } from "react";
import { useAuth } from '../../contexts/auth/AuthContext.jsx';
import { apiUtils } from "../../utils/newRequest.js";
import { useModal } from "../../contexts/modal/ModalContext.jsx";

// Styling
import TokenIcon from "../../assets/img/token.png";
import FriendIcon from "../../assets/img/friend.png";

import "./Friend.scss";
import { formatFloat } from "../../utils/formatter.js";

export default function Friend() {
    const { userInfo, setUserInfo } = useAuth();
    const { setModalInfo } = useModal();
    const [referralRewardStatistics, setReferralRewardStatistics] = useState({ referrals: 0, collected: 0, collectable: 0 });

    const handleShare = () => {
        const message = encodeURIComponent("Tap càng hăng, thưởng càng lớn. Tham gia Dragon Tap ngay");
        const telegramUrl = `https://t.me/share/url?url=https://t.me/qt_tap_bot?start=${userInfo.telegramId}&text=${message}`;
        window.open(telegramUrl, '_blank');
    };

    const getReferralRewardStatistics = async () => {
        try {
            const response = await apiUtils.post("/users/getReferralRewardStatistics", { telegramId: userInfo.telegramId });
            if (response) {
                const { collected, collectable } = response.data;
                setReferralRewardStatistics(response.data);
                console.log(`Collected: ${collected} tokens, Collectable: ${collectable} tokens`);
            }
        } catch (error) {
            setModalInfo({
                status: "error",
                message: `${error.response.data.message}`
            });
        }
    };

    useEffect(() => {
        getReferralRewardStatistics();
    }, []);


    const handleClaimReward = async (milestone) => {
        try {
            const response = await apiUtils.post("/users/claimReferralReward", { telegramId: userInfo.telegramId, milestone });
            if (response) {
                setUserInfo(response.data.user); // Update user info after claiming reward
                setModalInfo({
                    status: "success",
                    message: response.data.message
                });
                getReferralRewardStatistics();  // Refresh referral statistics after claiming reward
            }
        } catch (error) {
            setModalInfo({
                status: "error",
                message: `${error.response.data.message}`
            });
        }
    };

    const handleCollectReward = async () => {
        try {
            const response = await apiUtils.post("/users/collectReferralReward", { telegramId: userInfo.telegramId });
            if (response) {
                setUserInfo(response.data.referrer); // Update the user info with the new tokens
                setModalInfo({
                    status: "success",
                    message: response.data.message
                })
                getReferralRewardStatistics();
            }
        } catch (error) {
            setModalInfo({
                status: "error",
                message: `${error.response.data.message}`
            })
        }
    };

    return (
        <div className="mission friend">
            <section className="header flex-justify-center flex-align-center mb-20">
                <img src={FriendIcon} alt="" className="token-ic lg mr-8" />
                <h2>Bạn bè</h2>
            </section>

            <section className="statistic text-align-center mb-20">
                <h2 className="text-align-center mb-12">
                    Tokens từ bạn bè
                </h2>
                <p className="annotation mb-12">
                    Mời bạn bè để nhận <span className="highlight-text green fw-bold">10% hoa hồng</span> và chinh phục các mốc thưởng giá trị hơn
                </p>
                <div className="statistic-container">
                    <div className="statistic-item">
                        <div>
                            <strong className="statistic-item__title">{formatFloat(referralRewardStatistics.referrals)}</strong>
                        </div>
                        <div className="statistic-item__sub-title annotation">Bạn bè</div>
                    </div>
                    <hr />
                    <div className="statistic-item">
                        <div>
                            <strong className="statistic-item__title">{formatFloat(referralRewardStatistics.collectable)}</strong>
                        </div>
                        <div className="statistic-item__sub-title annotation">Khả dụng</div>
                    </div>
                    <hr />
                    <div className="statistic-item">
                        <div>
                            <strong className="statistic-item__title">{formatFloat(referralRewardStatistics.collected)}</strong>
                        </div>
                        <div className="statistic-item__sub-title annotation">Đã nhận</div>
                    </div>
                </div>

                <div className="flex-justify-space-between mt-12">
                    <button onClick={handleShare} className="btn btn-md w-50 btn-4 mt-8 invite-friend-btn mr-8">Mời bạn bè</button>
                    <button onClick={handleCollectReward} className={`btn btn-md w-50 ${referralRewardStatistics.collectable > 0 ? "btn-4" : "btn-5"} mt-8 reward-invitation-btn`}>Nhận thưởng</button>
                </div>
            </section >

            <section className="mission__daily mb-24">
                <div className="mission-container">
                    {[
                        { milestone: 'invite1', title: 'Mời 01 bạn bè', reward: 10000 },
                        { milestone: 'invite5', title: 'Mời 05 bạn bè', reward: 30000 },
                        { milestone: 'invite10', title: 'Mời 10 bạn bè', reward: 50000 },
                        { milestone: 'invite20', title: 'Mời 20 bạn bè', reward: 100000 },
                        { milestone: 'invite50', title: 'Mời 50 bạn bè', reward: 150000 },
                        { milestone: 'invite1000', title: 'Mời 1000 bạn bè', reward: 500000 }
                    ].map(({ milestone, title, reward }) => (
                        <div className="mission-item" key={milestone}>
                            <div className="mission-item--left">
                                <img src={FriendIcon} alt="" className="mission-item__ic" />
                                <div>
                                    <div>
                                        <strong className="mission-item__title">{title}</strong>
                                    </div>
                                    <span className="mission-item__sub-title flex-align-center">
                                        <img src={TokenIcon} className="token-ic sm mr-4" />
                                        <strong>+{formatFloat(reward)}</strong>
                                    </span>
                                </div>
                            </div>
                            <div className="mission-item--right">
                                <button
                                    onClick={() => handleClaimReward(milestone)}
                                    className={`btn btn-sm w-50 ${userInfo.referralMissions[milestone] ? 'btn-5' : 'btn-4'}`}
                                    disabled={userInfo.referrals.length < milestone.count || userInfo.referralMissions[milestone]}>
                                    {
                                        userInfo.referralMissions[milestone] ? "Đã nhận" : "Nhận thưởng"
                                    }
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
}