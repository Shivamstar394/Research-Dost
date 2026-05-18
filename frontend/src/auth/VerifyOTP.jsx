import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
export default function VerifyOTP(){

const location = useLocation();
const navigate = useNavigate();

const email = location.state?.email || "";

const [otp,setOtp] = useState("");
const [password,setPassword] = useState("");

const handleVerify = async () => {

const res = await fetch(`${API_BASE}/auth/verify-otp`,{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({email,otp})
});

const data = await res.json();

if(data.access_token){

await fetch(`${API_BASE}/auth/reset-password`,{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
email,
password
})
});

alert("Password changed successfully");

navigate("/login");

}

};

return(

<div className="auth-bg">

<div className="auth-card glass-card p-4">

<h2 className="mb-3">Verify OTP</h2>

<input
className="form-control mb-3"
value={email}
readOnly
/>

<input
className="form-control mb-3"
placeholder="Enter OTP"
onChange={(e)=>setOtp(e.target.value)}
/>

<input
className="form-control mb-3"
type="password"
placeholder="New Password"
onChange={(e)=>setPassword(e.target.value)}
/>

<button
className="btn btn-gradient w-100"
onClick={handleVerify}
>
Verify OTP & Reset Password
</button>

</div>

</div>

);

}