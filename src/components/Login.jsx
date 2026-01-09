import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

const Login = ({ onLogin }) => {
    const [loginData, setLoginData] = useState({
        emailOrPhone: "",
        password: "",
    });
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Only support email login for now
            const email = loginData.emailOrPhone.includes("@")
                ? loginData.emailOrPhone
                : "";

            const response = await fetch("http://localhost:5000/api/user/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email,
                    password: loginData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Login failed");
            } else {
                console.log("Login success:", data);

                // Save JWT token and user in localStorage
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));

                // Pass minimal user info to App.jsx
                // Pass minimal user info to App.jsx
                const userData = {
                    userId: data.user.userId,
                    name: data.user.name,
                    email: data.user.email,
                    mobile: data.user.mobile,
                    bloodGroup: data.user.bloodGroup,
                    emergencyContact: data.user.emergencyContact, // ✅ matches backend + profile
                    gender: data.user.gender,
                    address: data.user.address,
                    dateOfBirth: data.user.dateOfBirth, // ✅ correct key
                    role: data.user.role,
                };

                
                if (onLogin) onLogin(userData);

                // ✅ Role-based redirect
                if (data.user.role === "police") {
                    navigate("/police"); // Police dashboard
                } else {
                    navigate("/destination"); // Normal user
                }
            }
        } catch (error) {
            console.error("Error logging in:", error);
            alert("Server error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = (e) => {
        e.preventDefault();
        alert(`Password reset instructions sent to ${resetEmail}`);
        setShowForgotPassword(false);
        setResetEmail("");
    };

    return (
        <div className="login-container">
            <div className="login-form">
                {!showForgotPassword ? (
                    <>
                        <div className="login-header">
                            <h2>Login to SmartNav</h2>
                            <p>Welcome back to your navigation assistant</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <div className="input-icon">
                                    <i className="fas fa-user"></i>
                                </div>
                                <input
                                    type="text"
                                    name="emailOrPhone"
                                    placeholder="Email or Phone Number"
                                    value={loginData.emailOrPhone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <div className="input-icon">
                                    <i className="fas fa-lock"></i>
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={loginData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <button type="submit" className="login-btn" disabled={isLoading}>
                                {isLoading ? <div className="loading-spinner"></div> : "Login"}
                            </button>
                        </form>

                        <p
                            className="forgot-password"
                            onClick={() => setShowForgotPassword(true)}
                        >
                            Forgot Password?
                        </p>

                        <div className="divider">
                            <span>Or</span>
                        </div>

                        <p className="register-link">
                            Don&apos;t have an account?{" "}
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate("/register");
                                }}
                            >
                                Register here
                            </a>
                        </p>
                    </>
                ) : (
                    <>
                        <div className="login-header">
                            <h2>Reset Password</h2>
                            <p>Enter your email to reset your password</p>
                        </div>

                        <form onSubmit={handleForgotPassword}>
                            <div className="form-group">
                                <div className="input-icon">
                                    <i className="fas fa-envelope"></i>
                                </div>
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <button type="submit" className="login-btn">
                                Reset Password
                            </button>
                        </form>

                        <p
                            className="back-to-login"
                            onClick={() => setShowForgotPassword(false)}
                        >
                            Back to Login
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default Login;
