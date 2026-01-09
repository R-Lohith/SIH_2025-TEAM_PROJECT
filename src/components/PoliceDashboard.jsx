import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, UserCircle } from "lucide-react";
import "../styles/PoliceDashboard.css";

const PoliceDashboard = ({ onSelectUser }) => {
    const [query, setQuery] = useState("");
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // Mock search API → replace with backend call
    const handleSearch = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/police/search?q=${query}`);
            if (!res.ok) throw new Error("Failed to fetch user");
            const data = await res.json();
            setUser(data);
        } catch (error) {
            console.error(error);
            alert("User not found or server error");
        }
    };

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">Police Dashboard</h1>

            {/* Search Bar */}
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search by Name, Email, Mobile, or User ID..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button onClick={handleSearch}>
                    <Search size={18} />
                </button>
            </div>

            {/* User Info Card */}
            {user && (
                <div className="user-card">
                    <div className="user-avatar">
                        <UserCircle size={64} />
                    </div>
                    <div className="user-details">
                        <h2>{user.name}</h2>
                        <p><b>Email:</b> {user.email}</p>
                        <p><b>Phone:</b> {user.phone}</p>
                        <p><b>Emergency:</b> {user.emergency_number}</p>
                        <p><b>Blood Group:</b> {user.blood_group}</p>
                        <p><b>Gender:</b> {user.gender}</p>
                        <p><b>DOB:</b> {user.dob}</p>
                        <p><b>Address:</b> {user.address}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="action-buttons">
                        <button
                            className="btn-primary"
                            onClick={() => {
                                onSelectUser(user);
                                navigate("/police/map");
                            }}
                        >
                            Show Location
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={() => {
                                onSelectUser(user);
                                navigate("/police/history");
                            }}
                        >
                            Location History
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PoliceDashboard;
