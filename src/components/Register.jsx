// Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.css';

const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',   // instead of phone
        emergency_contact: '', // instead of emergencyContact
        gender: '',
        bloodGroup: '',
        dob: '',
        address: '',
        password: '',
        confirmPassword: ''
    });


    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate passwords
        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        if (formData.password.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }

        // Validate phone numbers
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(formData.mobile)) {
            alert('Enter a valid 10-digit phone number');
            return;
        }
        if (!phoneRegex.test(formData.emergency_contact)) {
            alert('Enter a valid 10-digit emergency contact number');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/user/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (response.ok) {
                alert('Registration successful!');
                navigate('/login');
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error(error);
            alert('Server error, try again later');
        }
    };

    return (
        <div className="register-container">
            <div className="register-form">
                <h2>Create Account</h2>
                <h4 className="map-app-heading">
                    Register to access location services and emergency support
                </h4>

                <form onSubmit={handleSubmit}>
                    <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
                    <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
                    <input type="tel" name="mobile" placeholder="Phone Number (10 digits)" value={formData.mobile} onChange={handleChange} required />

                    <input type="tel" name="emergency_contact" placeholder="Emergency Contact Number (10 digits)" value={formData.emergency_contact} onChange={handleChange} required />

                    <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
                    <input type="text" name="address" placeholder="Full Address" value={formData.address} onChange={handleChange} required />

                    <div className="gender-options">
                        <label>
                            <input type="radio" name="gender" value="Male" checked={formData.gender === 'Male'} onChange={handleChange} required /> Male
                        </label>
                        <label>
                            <input type="radio" name="gender" value="Female" checked={formData.gender === 'Female'} onChange={handleChange} required /> Female
                        </label>
                        <label>
                            <input type="radio" name="gender" value="Other" checked={formData.gender === 'Other'} onChange={handleChange} required /> Other
                        </label>
                    </div>

                    <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required>
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                    </select>

                    <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required minLength="6" />
                    <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />

                    <button type="submit" className="register-btn">Register</button>
                </form>

                <p className="login-link">
                    Already have an account?{' '}
                    <span className="link" onClick={() => navigate('/login')}>Login here</span>
                </p>
            </div>
        </div>
    );
};

export default Register;
