import React, { useState, useEffect } from 'react';
import { AlertTriangle, Phone, Shield, UserCircle } from 'lucide-react';
import SOSButton from './SOSButton';
import { useNavigate } from 'react-router-dom';
import '../styles/EmergencyPage.css';

const EmergencyPage = ({ route }) => {
    const [timer, setTimer] = useState(15 * 60); // 15 minutes in seconds
    const [familyNotified, setFamilyNotified] = useState(false);
    const [pageOpenedAt] = useState(new Date());

    const navigate = useNavigate();

    useEffect(() => {
        if (!familyNotified && timer > 0) {
            const interval = setInterval(() => {
                setTimer((prevTimer) => {
                    if (prevTimer <= 1) {
                        setFamilyNotified(true);
                        return 0;
                    }
                    return prevTimer - 1;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [familyNotified, timer]);

    const formatClockTime = (date) => {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let ampm = hours >= 12 ? "PM" : "AM";

        hours = hours % 12 || 12;
        minutes = minutes < 10 ? "0" + minutes : minutes;

        return `${hours}:${minutes} ${ampm}`;
    };

    const formatCountdown = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleFalseAlarm = () => {
        if (window.confirm('Are you sure this is a false alarm?')) {
            navigate('/map');
        }
    };

    const handleNotifyFamily = async() => {
        await fetch("https://n8n-1-szop.onrender.com/webhook/alert_sos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: "123", status: "lost" })
        });
        setFamilyNotified(true);
        setTimer(0);
        
    };

    const handleProfileClick = () => {
        navigate('/profile');
    };

    return (
        <div className={`emergency-page ${familyNotified ? "notified" : "alert"}`}>
            {/* Floating Profile Icon */}
            <button className="profile-button" onClick={handleProfileClick}>
                <UserCircle size={32} />
            </button>

            <SOSButton />

            <div className="emergency-container">
                <div className="emergency-content">
                    <div className="emergency-header">
                        <div className="emergency-icon">
                            <AlertTriangle size={48} />
                        </div>
                        <h1>Connection Lost</h1>
                        <p>We've detected you may need assistance</p>
                    </div>

                    {!familyNotified && (
                        <div className="timer-card">
                            <h2>Emergency Timer</h2>
                            <div className="current-time">
                                Started at: {formatClockTime(pageOpenedAt)}
                            </div>
                            <div className="timer-display">{formatCountdown(timer)}</div>
                            <p>Emergency contacts will be automatically notified when timer reaches 00:00</p>
                        </div>
                    )}

                    {familyNotified && (
                        <div className="notification-status">
                            <div className="status-icon">✅</div>
                            <h3>Family Notified</h3>
                            <p>Your emergency contacts have been sent your location and status.</p>
                        </div>
                    )}

                    <div className="emergency-actions">
                        <button
                            onClick={handleFalseAlarm}
                            className="false-alarm-button"
                        >
                            <Shield size={24} />
                            <span>False Alarm</span>
                        </button>

                        {!familyNotified ? (
                            <button
                                onClick={handleNotifyFamily}
                                className="alert-family-button"
                            >
                                <Phone size={24} />
                                <span>Notify Family</span>
                            </button>
                        ) : (
                            <button disabled className="alert-family-button notified">
                                <Phone size={24} />
                                <span>Notified Family</span>
                            </button>
                        )}
                    </div>

                    <div className="emergency-info">
                        <h3>Emergency Information</h3>
                        <div className="info-grid">
                            <div className="info-item"><strong>From:</strong> <span>{route?.from?.address || 'Location unavailable'}</span></div>
                            <div className="info-item"><strong>To:</strong> <span>{route?.to?.address || 'Destination unavailable'}</span></div>
                            <div className="info-item"><strong>Lost Location:</strong> <span>{route?.from?.address || 'Location unavailable'}</span></div>
                            <div className="info-item"><strong>Mode of Transport:</strong> <span style={{ textTransform: 'capitalize' }}>{route?.transportMode || 'Unknown'}</span></div>
                            <div className="info-item"><strong>Time:</strong> <span>{formatClockTime(new Date())} (Estimated)</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmergencyPage;
