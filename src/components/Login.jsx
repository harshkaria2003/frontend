import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Signup from './Signup';
import UserContext from "../context/UserContext";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSignup, setShowSignup] = useState(false);
  const { user, setUser } = useContext(UserContext);

  const navigate = useNavigate();


  useEffect(() => {
    if (user) {
      if (user.role_id === 1) {
        navigate("/");
      } else {
        navigate(`/profile/${user.id}`);
      }
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
       
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.user) {
        // Store in localStorage (optional)
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);

       
        if (data.user.role_id === 1) {
          navigate("/");
        } else {
          navigate(`/profile/${data.user.id}`);
        }
      } else {
        alert(data.error || "Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  if (showSignup) {
    return <Signup onClose={() => setShowSignup(false)} />;
  }

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="card p-4 shadow" style={{ width: '100%', maxWidth: '400px' }}>
        <h3 className="text-center mb-4">Login</h3>
        
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="btn btn-primary w-100" onClick={handleLogin}>
          Login
        </button>

        <p className="text-center mt-3">
          Don’t have an account?{' '}
          <button className="btn btn-link p-0" onClick={() => setShowSignup(true)}>
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
