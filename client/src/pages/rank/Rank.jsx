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

            <section className="statistic text-align-center mb-12">
                <h4 className="flex-align-self-start mb-12">
                    DragonTap sẽ tổng kết BXH và trao thưởng cho những người chơi hợp lệ
                </h4>
                <p className="annotation mb-12">
                    Tham gia Nami để trở thành một tài khoản hợp lệ và nhận các phần quà đặc biệt sau mỗi chu kỳ trò chơi
                </p>
                <div className="statistic-container">
                    <div className="statistic-item">
                        <div>
                            <strong className="statistic-item__title">{formatFloat(totalUsers)}+</strong>
                        </div>
                        <div className="statistic-item__sub-title annotation">người chơi</div>
                    </div>
                    <hr />
                    <div className="statistic-item">
                        <div>
                            <strong className="statistic-item__title">{formatFloat(Math.ceil(0.4 * totalUsers))}+</strong>
                        </div>
                        <div className="statistic-item__sub-title annotation">người chơi hợp lệ</div>
                    </div>
                    <hr />
                    <div className="statistic-item">
                        <div>
                            <strong className="statistic-item__title">5K USD</strong>
                        </div>
                        <div className="statistic-item__sub-title annotation">tiền thưởng</div>
                    </div>
                </div>
            </section >

            <section className="mb-12 text-align-center rank__leader-board">
                <h4 className="mb-12 text-align-center">
                    Các mốc phần thưởng
                </h4>
                <table className=''>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Số người dùng</th>
                            <th>Phần thưởng</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className={`${totalUsers >= 50000 ? "active" : ""}`}>
                            <td>01</td>
                            <td>50,000</td>
                            <td>1K USD</td>
                            <td>{totalUsers >= 50000 ? "Hoàn thành" : "Chưa đạt"}</td>
                        </tr>
                        <tr className={`${totalUsers >= 100000 ? "active" : ""}`}>
                            <td>02</td>
                            <td>100,000</td>
                            <td>2K USD</td>
                            <td>{totalUsers >= 100000 ? "Hoàn thành" : "Chưa đạt"}</td>
                        </tr>
                        <tr className={`${totalUsers >= 150000 ? "active" : ""}`}>
                            <td>03</td>
                            <td>150,000</td>
                            <td>3K USD</td>
                            <td>{totalUsers >= 150000 ? "Hoàn thành" : "Chưa đạt"}</td>
                        </tr>
                        <tr className={`${totalUsers >= 200000 ? "active" : ""}`}>
                            <td>04</td>
                            <td>200,000</td>
                            <td>4K USD</td>
                            <td>{totalUsers >= 200000 ? "Hoàn thành" : "Chưa đạt"}</td>
                        </tr>
                        <tr className={`${totalUsers >= 250000 ? "active" : ""}`}>
                            <td>05</td>
                            <td>250,000</td>
                            <td>5K USD</td>
                            <td>{totalUsers >= 250000 ? "Hoàn thành" : "Chưa đạt"}</td>
                        </tr>
                    </tbody>
                </table>
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

                <p className="annotation text-align-center"><span className="highlight-text green fw-bold">{formatFloat(totalUsers - 10)}+</span> người chơi khác cũng đang leo BXH DragonTap</p>
            </section>
        </div>
    );
}