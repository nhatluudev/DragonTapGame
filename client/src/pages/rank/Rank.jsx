import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CupIcon from "../../assets/img/cup.png";
import FirstPrizeIcon from "../../assets/img/first-prize.png";
import SecondPrizeIcon from "../../assets/img/second-prize.png";
import ThirdPrizeIcon from "../../assets/img/third-prize.png";
import './Rank.scss';
import { apiUtils } from '../../utils/newRequest';
import { formatFloat } from '../../utils/formatter';

export default function Rank() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [totalUsers, setTotalUsers] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Function to fetch the leaderboard data from the server
        const fetchLeaderboard = async () => {
            try {
                const response = await apiUtils.get('/users/leaderboard');
                console.log(response.data)
                setLeaderboard(response.data.leaderboard);
                setTotalUsers(response.data.totalUsers + 3720);
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

    // Show a loading spinner or message while data is being fetched
    if (loading) {
        return (
            <div className="loading">
                <div className="loading-spinner"></div>
                <h3>Đang tải ...</h3>
            </div>
        )
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
                <h4 className="flex-align-self-start mb-12">
                    DragonTap sẽ tổng kết BXH và trao thưởng cho người chơi hợp lệ
                </h4>
                <p className="annotation mb-12">
                    Tham gia Nami để trở thành một tài khoản hợp lệ và nhận các phần quà đặc biệt sau mỗi chu kỳ trò chơi
                </p>
                <div className="rank__statistic-container">
                    <div className="rank__statistic-item">
                        <div>
                            <strong className="rank__statistic-item__title">{formatFloat(totalUsers)}+</strong>
                        </div>
                        <div className="rank__statistic-item__sub-title annotation">người chơi</div>
                    </div>
                    <hr />
                    <div className="rank__statistic-item">
                        <div>
                            <strong className="rank__statistic-item__title">{Math.ceil(0.4 * totalUsers)}+</strong>
                        </div>
                        <div className="rank__statistic-item__sub-title annotation">người chơi hợp lệ</div>
                    </div>
                    <hr />
                    <div className="rank__statistic-item">
                        <div>
                            <strong className="rank__statistic-item__title">2K USD</strong>
                        </div>
                        <div className="rank__statistic-item__sub-title annotation">tiền thưởng</div>
                    </div>
                </div>
            </section >

            <section className="mb-12">
                <div className="rank__statistic-container">
                    <div className="rank__statistic-item">
                        <div>
                            <strong className="rank__statistic-item__title">Mốc 01</strong>
                        </div>
                        <div className="rank__statistic-item__sub-title annotation">50,000 người dùng</div>
                    </div>

                    <hr />

                    <div className="rank__statistic-item">
                        <div>
                            <strong className="rank__statistic-item__title">Mốc 01</strong>
                        </div>
                        <div className="rank__statistic-item__sub-title annotation">50,000 người dùng</div>
                    </div>

                    <div className="rank__statistic-item">
                        <div>
                            <strong className="rank__statistic-item__title">Mốc 01</strong>
                        </div>
                        <div className="rank__statistic-item__sub-title annotation">50,000 người dùng</div>
                    </div>


                    <div className="rank__statistic-item">
                        <div>
                            <strong className="rank__statistic-item__title">{Math.ceil(0.4 * totalUsers)}+</strong>
                        </div>
                        <div className="rank__statistic-item__sub-title annotation">người chơi hợp lệ</div>
                    </div>
                    <hr />
                    <div className="rank__statistic-item">
                        <div>
                            <strong className="rank__statistic-item__title">2K USD</strong>
                        </div>
                        <div className="rank__statistic-item__sub-title annotation">tiền thưởng</div>
                    </div>
                </div>

                <br />
                Mốc 02: 100,000 người dùng
                <br />
                Mốc 03: 150,000 người dùng
                <br />
                Mốc 04: 200,000 người dùng
                Mốc 05: 250,000 người dùng
            </section>

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
                        {leaderboard?.slice(0, 10).map((player, index) => (
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

                <p className="annotation text-align-center">{formatFloat(totalUsers - 10)}+ người chơi khác cũng đang leo BXH DragonTap</p>
            </section>
        </div>
    );
}