import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/PoliceDashboard.css";

const PoliceLocationHistory = ({ selectedUser }) => {
    const [history, setHistory] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!selectedUser) return;

        const fetchHistory = async () => {
            try {
                const res = await fetch(
                    `http://localhost:5000/api/location/get/${selectedUser.userId}`
                );
                const data = await res.json();
                setHistory(data);
            } catch (err) {
                console.error(err);
                alert("Failed to load location history");
            }
        };

        fetchHistory();
    }, [selectedUser]);

    return (
        <div className="history-page">
            <h2>{selectedUser?.name} - Location History</h2>
            <button onClick={() => navigate(-1)} className="btn-secondary">
                Back
            </button>

            <div className="history-list">
                {history.length > 0 ? (
                    history.map((loc, i) => (
                        <div key={i} className="history-item">
                            <p><b>Latitude:</b> {loc.lat}</p>
                            <p><b>Longitude:</b> {loc.lng}</p>
                            <p><b>Time:</b> {new Date(loc.recorded_at).toLocaleString()}</p>
                        </div>
                    ))
                ) : (
                    <p>No location history found</p>
                )}
            </div>
        </div>
    );
};

export default PoliceLocationHistory;
