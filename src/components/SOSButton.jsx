import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import '../styles/SOSButton.css';

const SOSButton = () => {
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSOSClick = async() => {
        await fetch("https://n8n-1-szop.onrender.com/webhook/alert_sos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: "123", status: "lost" })
        });

        setShowConfirm(true);
    };

    const handleConfirm = () => {
        alert('Emergency services have been contacted. Help is on the way.');
        setShowConfirm(false);
    };

    const handleCancel = () => {
        setShowConfirm(false);
    };

    return (
        <>
            <button className="sos-button" onClick={handleSOSClick}>
                <AlertTriangle size={24} />
                <span>SOS</span>
            </button>

            {showConfirm && (
                <div className="sos-popup-overlay">
                    <div className="sos-popup">
                        <div className="sos-popup-icon">
                            <AlertTriangle size={48} />
                        </div>
                        <h3>Emergency SOS</h3>
                        <p>Are you sure you want to contact emergency services?</p>
                        <div className="sos-popup-buttons">
                            <button onClick={handleCancel} className="cancel-button">
                                Cancel
                            </button>
                            <button onClick={handleConfirm} className="confirm-button">
                                Call Emergency
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SOSButton;