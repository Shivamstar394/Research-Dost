import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import AuthLayout from "./AuthLayout";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ──── Normal Signup ────
  const handleSignup = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        navigate("/Dashboard");
      } else {
        setError(data.detail || "Signup failed. Please try again.");
      }
    } catch (err) {
      setError("Connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ──── Google Signup ────
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
        setError(data.detail || "Google signup failed");
      }
    } catch (err) {
      setError("Google signup failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google signup was cancelled or failed.");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSignup();
  };

  return (
    <AuthLayout>
      <h2 className="auth-title">Create Account</h2>

      {/* Error */}
      {error && (
        <div className="auth-error">
          <span className="auth-error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* ──── Google Signup First (prominent) ──── */}
      <div className="auth-social-section auth-social-top">
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
              text="signup_with"
              shape="pill"
              logo_alignment="left"
            />
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="auth-divider">
        <span className="auth-divider-line" />
        <span className="auth-divider-text">Or sign up with email</span>
        <span className="auth-divider-line" />
      </div>

      {/* Email */}
      <input
        className="auth-input"
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading || googleLoading}
      />

      {/* Password */}
      <input
        className="auth-input"
        type="password"
        placeholder="Password (min 6 characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading || googleLoading}
      />

      {/* Confirm Password */}
      <input
        className="auth-input"
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading || googleLoading}
      />

      {/* Signup Button */}
      <button
        className="auth-button"
        onClick={handleSignup}
        disabled={loading || googleLoading}
      >
        {loading ? (
          <span className="auth-btn-loading">
            <span className="auth-spinner" />
            Creating account…
          </span>
        ) : (
          "Create Account"
        )}
      </button>

      {/* Login Link */}
      <p className="auth-link">
        Already have an account? <a href="/login">Login</a>
      </p>

      {/* Terms */}
      <p className="auth-terms">
        By creating an account, you agree to Research Dost's{" "}
        <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </p>
    </AuthLayout>
  );
}