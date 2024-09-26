import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CupIcon from "../../assets/img/cup.png";
import FirstPrizeIcon from "../../assets/img/first-prize.png";
import SecondPrizeIcon from "../../assets/img/second-prize.png";
import ThirdPrizeIcon from "../../assets/img/third-prize.png";
import './Rank.scss';
import { apiUtils } from '../../utils/newRequest';

export default function Rank() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Function to fetch the leaderboard data from the server
        const fetchLeaderboard = async () => {
            try {
                const response = await apiUtils.get('/users/leaderboard');
                setLeaderboard(response.data.leaderboard);
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
            } finally {
                setLoading(false);
            }
        };

        // Fetch leaderboard every 5 seconds to update frequently
        const intervalId = setInterval(fetchLeaderboard, 5000); // 5 seconds
        fetchLeaderboard(); // Initial fetch

        return () => clearInterval(intervalId); // Cleanup on component unmount
    }, []);

    if (loading) {
        return <div>Loading leaderboard...</div>;
    }

    return (
        <div className="rank">
            <section className="header flex-justify-center mb-20">
                <h2 className="flex-align-center flex-justify-center">
                    <img src={CupIcon} className="header__ic mr-8" alt="" />
                    Bảng xếp hạng
                </h2>
            </section>

            <section className="rank__statistic text-align-center mb-20">
                <h4 className="flex-align-self-start mb-20">
                    BXH sẽ đóng và trao thưởng khi đạt 200,000 người chơi
                </h4>
                <div className="rank__statistic-container">
                    <div className="rank__statistic-item">
                        <div>
                            <strong className="rank__statistic-item__title">140,000</strong>
                        </div>
                        <br />
                        <span className="rank__statistic-item__sub-title annotation">người chơi</span>
                    </div>
                    <hr />
                    <div className="rank__statistic-item">
                        <div>
                            <strong className="rank__statistic-item__title">3,000,000</strong>
                        </div>
                        <br />
                        <span className="rank__statistic-item__sub-title annotation">tokens</span>
                    </div>
                    <hr />
                    <div className="rank__statistic-item">
                        <div>
                            <strong className="rank__statistic-item__title">150M VND</strong>
                        </div>
                        <br />
                        <span className="rank__statistic-item__sub-title annotation">tiền thưởng</span>
                    </div>
                </div>
            </section >

            <section className="rank__leader-board">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Người chơi</th>
                            <th>Tokens</th>
                            <th>Phần thưởng</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.map((player, index) => (
                            <tr key={index}>
                                <td>
                                    {index === 0 ? <img src={FirstPrizeIcon} alt="" />
                                        : index === 1 ? <img src={SecondPrizeIcon} alt="" />
                                            : index === 2 ? <img src={ThirdPrizeIcon} alt="" />
                                                : index + 1}
                                </td>
                                <td>{player?.firstName} {player?.lastName}</td>
                                <td>{player?.tokens.toLocaleString()}</td>
                                <td>-</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <p className="annotation text-align-center">140.000+ người chơi khác cũng đang leo BXH DragonTap</p>
            </section>
        </div>
    );
}