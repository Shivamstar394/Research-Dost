import React from "react";
import "../auth/auth.css";
import logo from "/research-dost-logo.png"; // add your logo
import BrandWordmark from "../components/BrandWordmark";
export default function AuthLayout({ children }) {
  return (
    <div className="auth-wrapper">
    {/* ✅ THIS IS YOUR SINGLE FULL-SCREEN BACKGROUND */}
      <img 
        className="auth-bg-full" 
        src="/auth_background.png"
        alt="Background" 
      />
      
     
      <div className="auth-container">

        {/* Left Side */}
        <div className="auth-left">
          <div className="auth-logo">
        <div className="logo-circle">
          <img src={logo} alt="Research Dost" />
          
        </div>

            <div className="auth-logo-word auth-word-pop">
              <BrandWordmark animate />
            </div>
          </div>

          <div className="auth-form-card">
            {children}
          </div>
        </div>

        {/* Right Side */}
        <div className="auth-right">
          <div className="auth-illustration">
            {/* You can replace with your own SVG */}
            <img
              src="https://www.bing.com/th/id/OGC.75e7ef7aa27009befb076509382b86b8?o=7&pid=1.7&rm=3&rurl=https%3a%2f%2fi.pinimg.com%2foriginals%2f18%2fa4%2f94%2f18a4949fc9c8067172d3b96e302e7097.gif&ehk=cNSAgKm%2f1XwdpwB8s50Q4AP4%2fOnYS1sU5ZJdzqNK1U4%3d"
              alt="Illustration"
            />
          </div>
        </div>

      </div>
    </div>
  );
}