import React, { useState } from 'react';
import { MapPin, Navigation, Car, Bus, Train, Users, Bike, UserCircle } from 'lucide-react';
import SOSButton from './SOSButton';
import { useNavigate } from 'react-router-dom';
import '../styles/DestinationInput.css';

const DestinationInput = ({ onRouteGenerated }) => {
    const [fromLocation, setFromLocation] = useState('');
    const [toLocation, setToLocation] = useState('');
    const [transportMode, setTransportMode] = useState('car');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState({ from: [], to: [] });
    const [isSafetyMap, setIsSafetyMap] = useState(false);

    const navigate = useNavigate();

    const transportModes = [
        { mode: 'car', icon: Car, label: 'Car', color: 'transport-car' },
        { mode: 'bus', icon: Bus, label: 'Bus', color: 'transport-bus' },
        { mode: 'train', icon: Train, label: 'Train', color: 'transport-train' },
        { mode: 'walk', icon: Users, label: 'Walk', color: 'transport-walk' },
        { mode: 'bike', icon: Bike, label: 'Bike', color: 'transport-bike' },
    ];

    const tamilNaduCities = [
        'Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem',
        'Tirunelveli', 'Vellore', 'Erode', 'Thoothukudi', 'Dindigul',
        'Thanjavur', 'Hosur', 'Nagercoil', 'Kanchipuram', 'Kanyakumari',
        'Karaikudi', 'Cuddalore', 'Kumbakonam', 'Tiruppur', 'Ooty',
        'Yercaud', 'Rameswaram', 'Kodaikanal', 'Bangalore'
    ];

    const handleInputChange = (field, value) => {
        if (field === 'from') setFromLocation(value);
        else setToLocation(value);

        if (value.length > 1) {
            const filtered = tamilNaduCities.filter(city =>
                city.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(prev => ({ ...prev, [field]: filtered }));
        } else {
            setSuggestions(prev => ({ ...prev, [field]: [] }));
        }
    };

    const selectSuggestion = (field, city) => {
        if (field === 'from') setFromLocation(city);
        else setToLocation(city);
        setSuggestions(prev => ({ ...prev, [field]: [] }));
    };

    const handleGenerateRoute = async () => {
        if (!fromLocation.trim() || !toLocation.trim()) {
            alert('Please enter both from and to locations');
            return;
        }
        if (fromLocation.toLowerCase() === toLocation.toLowerCase()) {
            alert('From and To locations cannot be the same');
            return;
        }

        setIsLoading(true);
        try {
            let routeData;
            if (isSafetyMap) {
                const url = `http://localhost:5001/generate_and_save_route?from=${encodeURIComponent(fromLocation)}&to=${encodeURIComponent(toLocation)}&mode=${transportMode}`;
                const response = await fetch(url);
                console.log('Safety Map Request URL:', url);
                if (!response.ok) throw new Error(`Failed to generate safety map: ${response.status} - ${await response.text()}`);
                const filename = await response.text();  // Will be 'tamilnadu_route_map.html'
                routeData = { filename, isSafetyMap: true, fromLocation, toLocation, transportMode };
            } else {
                const url = `http://localhost:5001/generate_route?from=${encodeURIComponent(fromLocation)}&to=${encodeURIComponent(toLocation)}&mode=${transportMode}`;
                const response = await fetch(url);
                console.log('Normal Map Request URL:', url);
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to generate route: ${response.status} - ${errorText}`);
                }
                const data = await response.json();
                routeData = {
                    ...data,
                    isSafetyMap: false,
                    fromLocation,
                    toLocation,
                    transportMode
                };
            }
            onRouteGenerated(routeData);
            navigate('/map', { state: { routeData } });
        } catch (error) {
            console.error('Route generation error:', error);
            alert(`Failed to generate route. Please try again. Details: ${error.message}. Ensure the backend server is running at http://localhost:5001.`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileClick = () => {
        navigate('/profile');
    };

    return (
        <div className="destination-input">
            <button className="profile-button" onClick={handleProfileClick}>
                <UserCircle size={32} />
            </button>

            <SOSButton />
            <div className="destination-container">
                <div className="header">
                    <div className="logo">
                        <Navigation size={32} />
                    </div>
                    <h1>SmartNav</h1>
                    <p>Your intelligent navigation companion of India</p>
                </div>

                <div className="form-card">
                    <div className="input-group">
                        <div className="input-field">
                            <label>From</label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    value={fromLocation}
                                    onChange={(e) => handleInputChange('from', e.target.value)}
                                    placeholder="Enter starting location (e.g., Chennai)"
                                />
                            </div>
                            {suggestions.from.length > 0 && (
                                <div className="suggestions">
                                    {suggestions.from.map(city => (
                                        <div
                                            key={city}
                                            className="suggestion-item"
                                            onClick={() => selectSuggestion('from', city)}
                                        >
                                            {city}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="input-field">
                            <label>To</label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    value={toLocation}
                                    onChange={(e) => handleInputChange('to', e.target.value)}
                                    placeholder="Enter destination (e.g., Coimbatore)"
                                />
                            </div>
                            {suggestions.to.length > 0 && (
                                <div className="suggestions">
                                    {suggestions.to.map(city => (
                                        <div
                                            key={city}
                                            className="suggestion-item"
                                            onClick={() => selectSuggestion('to', city)}
                                        >
                                            {city}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="transport-card">
                    <h3>Transport Mode</h3>
                    <div className="transport-grid">
                        {transportModes.map(({ mode, icon: Icon, label, color }) => (
                            <button
                                key={mode}
                                onClick={() => setTransportMode(mode)}
                                className={`transport-button ${transportMode === mode ? color : ''}`}
                            >
                                <Icon size={24} />
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="safety-toggle">
                    <label>
                        <input
                            type="checkbox"
                            checked={isSafetyMap}
                            onChange={(e) => setIsSafetyMap(e.target.checked)}
                        />
                        Show Safety Zones
                    </label>
                </div>

                <button
                    onClick={handleGenerateRoute}
                    disabled={isLoading}
                    className="generate-button"
                >
                    {isLoading ? (
                        <div className="loading-content">
                            <div className="spinner"></div>
                            Generating Route...
                        </div>
                    ) : (
                        'Find Best Route'
                    )}
                </button>
            </div>
        </div>
    );
};

export default DestinationInput;