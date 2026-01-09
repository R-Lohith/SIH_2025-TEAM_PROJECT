import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import { Clock, Route as RouteIcon, Edit3, UserCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import L from "leaflet";
import SOSButton from "./SOSButton";
import "leaflet/dist/leaflet.css";
import "../styles/MapView.css";

// ⚠️ Replace with your OpenWeather API key
const API_KEY = "daa43b06cc327c944b3cc66852ba69fe";

const MapView = ({ userId, onSimulateConnectionLoss }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { routeData } = location.state || {};
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [isHeatmapMain, setIsHeatmapMain] = useState(false);

  // Derive route data from routeData prop or fallback to defaults
  const route = routeData || {};
  const fromLocation = route.fromLocation || "Chennai";
  const toLocation = route.toLocation || "Chennai";
  const transportMode = route.transportMode || "car";
  const isSafetyMap = route.isSafetyMap || false;
  const filename = route.filename || "tamilnadu_route_map.html";  // Fixed filename
  const directions = Array.isArray(route.directions) && route.directions.length > 0 ? route.directions : [[13.0827, 80.2707], [13.0827, 80.2707]]; // Fallback to straight line

  // Default coordinates based on routeData or Chennai
  const initialFrom = route?.from?.lat && route?.from?.lng
    ? [route.from.lat, route.from.lng]
    : [13.0827, 80.2707]; // Chennai
  const initialTo = route?.to?.lat && route?.to?.lng
    ? [route.to.lat, route.to.lng]
    : [13.0827, 80.2707]; // Chennai

  const [currentPos, setCurrentPos] = useState(initialFrom);
  const [fromPos] = useState(initialFrom);
  const [destination] = useState(initialTo);

  // Weather state
  const [fromWeather, setFromWeather] = useState(null);
  const [toWeather, setToWeather] = useState(null);

  // Custom marker icons
  const currentIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  const defaultIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  // Helpers
  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getTransportIcon = (mode) => {
    switch (mode) {
      case "car":
        return "🚗";
      case "bus":
        return "🚌";
      case "train":
        return "🚊";
      case "walk":
        return "🚶";
      default:
        return "🚗";
    }
  };

  // Actions
  const handleFinishTrip = () => {
    if (showFinishConfirm) {
      navigate("/destination");
    } else {
      setShowFinishConfirm(true);
      setTimeout(() => setShowFinishConfirm(false), 3000);
    }
  };

  const handleEditDestinations = () => navigate("/destination");
  const handleProfileClick = () => navigate("/profile");
  const handleMapSwap = () => setIsHeatmapMain(!isHeatmapMain);

  // ✅ Fetch weather
  useEffect(() => {
    const fetchWeather = async (lat, lon, setState) => {
      try {
        const weatherRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const weatherData = await weatherRes.json();
        if (weatherData.cod === 200) {
          setState({
            temp: weatherData.main?.temp,
            condition: weatherData.weather?.[0]?.main,
          });
        } else {
          console.error("Weather API error:", weatherData.message);
          setState(null);
        }
      } catch (err) {
        console.error("Weather API fetch failed:", err);
        setState(null);
      }
    };
    if (fromPos) fetchWeather(fromPos[0], fromPos[1], setFromWeather);
    if (destination) fetchWeather(destination[0], destination[1], setToWeather);
  }, [fromPos, destination]);

  // Watch live location
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setCurrentPos([latitude, longitude]);
          try {
            await fetch("http://localhost:5001/api/location/store", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId, latitude, longitude }),
            });
          } catch (err) {
            console.error("Error sending location:", err);
          }
        },
        (err) => console.error("Geolocation error:", err),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [userId]);

  const polyline = directions;

  return (
    <div className="map-view">
      {/* Profile Button */}
      <button className="profile-button" onClick={handleProfileClick}>
        <UserCircle size={32} />
      </button>
      <SOSButton />
      {/* Header */}
      <div className="map-header">
        <div className="route-info">
          <div className="transport-display">
            <span className="transport-emoji">
              {getTransportIcon(transportMode)}
            </span>
            <div className="route-details">
              <div className="top-row">
                <div className="time-distance">
                  <div className="detail-item">
                    <Clock size={16} />
                    <span>{formatDuration(route?.duration || 0)}</span>
                  </div>
                  <div className="detail-item">
                    <RouteIcon size={16} />
                    <span>{(route?.distance || 0).toFixed(1)} km</span>
                  </div>
                </div>
                <div className="location-info">
                  <div className="location-item">
                    <span className="label">From:</span>
                    <span className="address">{fromLocation}</span>
                    {fromWeather && (
                      <span className="weather-note">
                        🌦 {fromWeather.temp}°C, {fromWeather.condition}
                      </span>
                    )}
                  </div>
                  <div className="location-item">
                    <span className="label">To:</span>
                    <span className="address">{toLocation}</span>
                    {toWeather && (
                      <span className="weather-note">
                        🌦 {toWeather.temp}°C, {toWeather.condition}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="transport-mode">{transportMode}</div>
        </div>
      </div>
      {/* Map + Heatmap */}
      <div className="map-area">
        {/* Route Map */}
        <div className={`map-container ${isHeatmapMain ? "thumbnail" : "full"}`}>
          <MapContainer
            center={fromPos}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            zoomControl={true}
            scrollWheelZoom={true}
            doubleClickZoom={true}
            touchZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <Marker position={fromPos} icon={defaultIcon} />
            <Marker position={destination} icon={defaultIcon} />
            <Marker position={currentPos} icon={currentIcon} />
            <Polyline positions={polyline} color="#4285F4" />
          </MapContainer>
          <div
            className={`thumbnail-overlay ${isHeatmapMain ? "active" : ""}`}
            onClick={isHeatmapMain ? handleMapSwap : undefined}
          />
        </div>
        {/* Heatmap */}
        <div className={`heatmap-container ${isHeatmapMain ? "full" : "thumbnail"}`}>
          <iframe
            src={isSafetyMap ? `/public/${filename}` : "/public/tamilnadu_route_map.html"}  // Consistent filename
            title="Heatmap"
            style={{
              height: "100%",
              width: "100%",
              border: "none",
              pointerEvents: isHeatmapMain ? "auto" : "none",
            }}
            onError={(e) => console.error("Iframe load error:", e)}
          />
          <div
            className={`thumbnail-overlay ${!isHeatmapMain ? "active" : ""}`}
            onClick={!isHeatmapMain ? handleMapSwap : undefined}
          />
        </div>
        {/* Simulate Button */}
        {!isHeatmapMain && (
          <div className="map-overlay">
            <button onClick={onSimulateConnectionLoss} className="simulate-button">
              Simulate Connection Loss (Demo)
            </button>
          </div>
        )}
      </div>
      {/* Bottom controls */}
      <div className="bottom-controls">
        <div className="control-buttons">
          <button onClick={handleEditDestinations} className="edit-button">
            <Edit3 size={20} />
            <span>Edit Destinations</span>
          </button>
          <button
            onClick={handleFinishTrip}
            className={`finish-button ${showFinishConfirm ? "confirm" : ""}`}
          >
            {showFinishConfirm ? "Tap again to confirm" : "Finish Trip"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapView;