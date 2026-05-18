import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
export default function ForgotPassword() {
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const [email,setEmail] = useState("");
const [loading,setLoading] = useState(false);
const navigate = useNavigate();
const handleSendOTP = async () => {

setLoading(true);

const res = await fetch(`${API_BASE}/auth/request-otp`,{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({email})
});

const data = await res.json();

alert("OTP sent successfully");

navigate("/verify-otp", { state: { email } });

setLoading(false);
};

return(
<motion.div
initial={{opacity:0,y:40}}
animate={{opacity:1,y:0}}
transition={{duration:0.6}}
className="auth-bg"
>
<div className="auth-card glass-card p-4 text-center">

    <h2 className="mb-3">Forgot Password</h2>

    <p className="text-muted mb-3">
      Enter your email to receive a verification OTP.
    </p>

    <input
      className="form-control mb-3"
      placeholder="Email"
      onChange={(e)=>setEmail(e.target.value)}
    />

    <button
      className="btn btn-gradient w-100"
      onClick={handleSendOTP}
    >
      Send OTP
    </button>

</div>
</motion.div>
);

}