import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "../styles/PoliceDashboard.css";

// Component to invalidate map size and center
function MapEffect({ location }) {
    const map = useMap();
    const isInitialized = useRef(false);

    useEffect(() => {
        if (location && location.lat && location.lng && !isInitialized.current) {
            // Validate coordinates
            if (
                typeof location.lat === "number" &&
                typeof location.lng === "number" &&
                location.lat >= -90 &&
                location.lat <= 90 &&
                location.lng >= -180 &&
                location.lng <= 180
            ) {
                map.setView([location.lat, location.lng], 13);
                // Delay invalidateSize to ensure container is ready
                setTimeout(() => {
                    map.invalidateSize();
                    console.log("Map centered at:", [location.lat, location.lng]);
                }, 100);
                isInitialized.current = true;
            } else {
                console.error("Invalid coordinates:", location.lat, location.lng);
            }
        }
    }, [map, location]);

    return null;
}

const PoliceMapView = ({ selectedUser }) => {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const mapRef = useRef(null); // Ref to access the MapContainer

    useEffect(() => {
        if (!selectedUser || !selectedUser.userId) {
            setError("No user selected or invalid user ID");
            return;
        }

        const fetchLocation = async () => {
            try {
                const res = await fetch(
                    `http://localhost:5000/api/location/get/${selectedUser.userId}`,
                    {
                        headers: {
                            "User-Agent": "PoliceDashboard/1.0 (contact@example.com)",
                        },
                    }
                );
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const data = await res.json();
                console.log("API Response:", data);
                if (data && data.length > 0) {
                    const latest = data[0];
                    // Validate coordinates
                    if (!latest.lat || !latest.lng || isNaN(latest.lat) || isNaN(latest.lng)) {
                        throw new Error("Invalid coordinates received");
                    }

                    // Reverse geocoding using Nominatim
                    const geoRes = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latest.lat}&lon=${latest.lng}`,
                        {
                            headers: {
                                "User-Agent": "PoliceDashboard/1.0 (contact@example.com)",
                            },
                        }
                    );
                    if (!geoRes.ok) {
                        throw new Error(`Geocoding error! status: ${geoRes.status}`);
                    }
                    const geoData = await geoRes.json();
                    console.log("Geocoding Response:", geoData);

                    setLocation({
                        ...latest,
                        address: geoData.display_name || "Address not found",
                    });
                    setError(null);
                } else {
                    // Fallback to default coordinates
                    setLocation({
                        lat: 11.5333, // Sathyamangalam, Tamil Nadu
                        lng: 77.2333,
                        address: "Sathyamangalam, Erode, Tamil Nadu, India",
                    });
                    console.warn("No location data, using fallback coordinates");
                }
            } catch (err) {
                console.error("Error fetching location:", err);
                setError("Failed to load location data. Using fallback coordinates.");
                setLocation({
                    lat: 11.5333, // Sathyamangalam, Tamil Nadu
                    lng: 77.2333,
                    address: "Sathyamangalam, Erode, Tamil Nadu, India",
                });
            }
        };

        fetchLocation();
    }, [selectedUser]);

    return (
        <div className="map-page">
            <div className="map-header">
                <h2>
                    {selectedUser?.name || "User"} - {location?.address || "Loading..."}
                </h2>
                <div>
                    <button onClick={() => navigate(-1)} className="btn-secondary">
                        Back
                    </button>
                    <button onClick={() => navigate("/profile")} className="btn-primary">
                        Profile
                    </button>
                </div>
            </div>
            <div className="map-container12" ref={mapRef}>
                {error ? (
                    <p style={{ color: "red", textAlign: "center" }}>{error}</p>
                ) : location && location.lat && location.lng ? (
                    <MapContainer
                        center={[location.lat, location.lng]}
                        zoom={13}
                        style={{ height: "100%", width: "100%" }}
                        className="leaflet-container"
                    >
                        {/* Primary Tile Layer */}
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                        />
                        {/* Fallback Tile Layer (in case primary fails) */}
                        <TileLayer
                            url="https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
                            errorTileUrl="https://stadiamaps.coma/assets/error-tile.png"
                        />
                        <Marker position={[location.lat, location.lng]}>
                            <Popup>
                                {selectedUser?.name || "User"} - {location?.address}
                            </Popup>
                        </Marker>
                        <MapEffect location={location} />
                    </MapContainer>
                ) : (
                    <p style={{ textAlign: "center" }}>Loading location...</p>
                )}
            </div>
        </div>
    );
};

export default PoliceMapView;