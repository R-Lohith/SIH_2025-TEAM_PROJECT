// ProfilePage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProfilePage.css";

const ProfilePage = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);

    
    useEffect(() => {
        // Load user info from localStorage (after login)
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
            setUserData(storedUser);
            console.log(storedUser,"User data");
            
        } else {
            navigate("/login"); // if not logged in, redirect
        }
    }, [navigate]);

    const handleBack = () => {
        navigate(-1);
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login");
    };

    if (!userData) {
        return <div>Loading...</div>;
    }

    return (
        <div className="profile-page">
            <div className="profile-header">
                <button className="back-button" onClick={handleBack}>
                    &larr; Back
                </button>
                <h2>User Profile</h2>
            </div>

            <div className="profile-card">
                {/* User Icon */}
                <div className="user-icon-container">
                    <div className="user-icon">
                        <i className="fas fa-user"></i>
                    </div>
                </div>

                <h3 className="user-name">{userData.name}</h3>
                <p className="user-email">{userData.email}</p>

                <div className="profile-details">
                    <div className="detail-item">
                        <div className="detail-icon">
                            <i className="fas fa-phone"></i>
                        </div>
                        <div className="detail-content">
                            <div className="detail-label">PHONE NUMBER</div>
                            <div className="detail-value">{userData.mobile}</div>
                        </div>
                    </div>

                    <div className="detail-item">
                        <div className="detail-icon">
                            <i className="fas fa-phone-alt"></i>
                        </div>
                        <div className="detail-content">
                            <div className="detail-label">EMERGENCY CONTACT</div>
                            <div className="detail-value">{userData.emergencyContact}</div>
                        </div>
                    </div>

                    <div className="detail-item">
                        <div className="detail-icon">
                            <i className="fas fa-venus-mars"></i>
                        </div>
                        <div className="detail-content">
                            <div className="detail-label">GENDER</div>
                            <div className="detail-value">{userData.gender}</div>
                        </div>
                    </div>

                    <div className="detail-item">
                        <div className="detail-icon">
                            <i className="fas fa-tint"></i>
                        </div>
                        <div className="detail-content">
                            <div className="detail-label">BLOOD GROUP</div>
                            <div className="detail-value">{userData.bloodGroup}</div>
                        </div>
                    </div>

                    <div className="detail-item">
                        <div className="detail-icon">
                            <i className="fas fa-home"></i>
                        </div>
                        <div className="detail-content">
                            <div className="detail-label">ADDRESS</div>
                            <div className="detail-value">{userData.address}</div>
                        </div>
                    </div>

                    <div className="detail-item">
                        <div className="detail-icon">
                            <i className="fas fa-calendar-alt"></i>
                        </div>
                        <div className="detail-content">
                            <div className="detail-label">DATE OF BIRTH</div>
                            <div className="detail-value">{userData.dateOfBirth}</div>
                        </div>
                    </div>
                </div>

                <button className="logout-btn" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;
