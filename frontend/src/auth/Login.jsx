import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import AuthLayout from "./AuthLayout";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ──── Normal Email/Password Login ────
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        navigate("/Dashboard");
      } else {
        setError(data.detail || "Invalid credentials");
      }
    } catch (err) {
      setError("Connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ──── Google Login Success ────
  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: credentialResponse.credential,
        }),
      });

      const data = await res.json();

      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        navigate("/Dashboard");
      } else {
        setError(data.detail || "Google login failed");
      }
    } catch (err) {
      setError("Google login failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  // ──── Google Login Error ────
  const handleGoogleError = () => {
    setError("Google login was cancelled or failed. Please try again.");
  };

  // ──── Handle Enter Key ────
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <AuthLayout>
      <h2 className="auth-title">Login</h2>

      {/* Error Alert */}
      {error && (
        <div className="auth-error">
          <span className="auth-error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* Email Input */}
      <input
        className="auth-input"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading || googleLoading}
      />

      {/* Password Input */}
      <input
        className="auth-input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading || googleLoading}
      />

      {/* Forgot Password */}
      <div className="auth-forgot-row">
        <a href="/forgot-password" className="auth-forgot-link">
          Forgot Password?
        </a>
      </div>

      {/* Login Button */}
      <button
        className="auth-button"
        onClick={handleLogin}
        disabled={loading || googleLoading}
      >
        {loading ? (
          <span className="auth-btn-loading">
            <span className="auth-spinner" />
            Logging in…
          </span>
        ) : (
          "Login"
        )}
      </button>

      {/* Register Link */}
      <p className="auth-link">
        No account? <a href="/signup">Register</a>
      </p>

      {/* ──── Divider ──── */}
      <div className="auth-divider">
        <span className="auth-divider-line" />
        <span className="auth-divider-text">Or continue with</span>
        <span className="auth-divider-line" />
      </div>

      {/* ──── Social Login Buttons ──── */}
      <div className="auth-social-section">
        {/* Google Login */}
        <div className="google-btn-wrapper">
          {googleLoading ? (
            <div className="auth-social-loading">
              <span className="auth-spinner" />
              <span>Connecting to Google…</span>
            </div>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              width="100%"
              text="continue_with"
              shape="pill"
              logo_alignment="left"
            />
          )}
        </div>

        {/* Custom styled Google button (alternative — use this if you want full control) */}
        {/* 
        <button className="auth-social-btn auth-google-btn" onClick={handleGoogleCustom}>
          <svg className="auth-social-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
        */}
      </div>

      {/* Terms */}
      <p className="auth-terms">
        By continuing, you agree to Research Dost's{" "}
        <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </p>
    </AuthLayout>
  );
}