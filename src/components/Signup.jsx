import React, { useEffect, useState } from 'react';

export default function Signup({ onClose }) {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    gender: '',
    country_id: ''
  });

  const [countries, setCountries] = useState([]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch('http://localhost:8000/signup.php?countries=1');
        const data = await res.json();
        setCountries(data);
      } catch (err) {
        console.error('Error fetching countries:', err);
      }
    };
    fetchCountries();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSignup = async () => {
    try {
      const res = await fetch('http://localhost:8000/signup.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert('Signup successful! Please login.');
        onClose && onClose();
      } else {
        alert(data.error || 'Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Failed to connect to the server.');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="card shadow p-4 w-100" style={{ maxWidth: '600px' }}>
        <h3 className="text-center mb-4">Create an Account</h3>

        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">First Name</label>
            <input type="text" className="form-control" name="first_name" value={form.first_name} onChange={handleChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Last Name</label>
            <input type="text" className="form-control" name="last_name" value={form.last_name} onChange={handleChange} />
          </div>

          <div className="col-md-6">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" name="password" value={form.password} onChange={handleChange} />
          </div>

          <div className="col-md-6">
            <label className="form-label">Phone</label>
            <input type="text" className="form-control" name="phone" value={form.phone} onChange={handleChange} />
          </div>

          <div className="col-md-6">
            <label className="form-label d-block">Gender</label>
            <div className="form-check form-check-inline">
              <input type="radio" className="form-check-input" name="gender" value="Male" checked={form.gender === 'Male'} onChange={handleChange} />
              <label className="form-check-label">Male</label>
            </div>
            <div className="form-check form-check-inline">
              <input type="radio" className="form-check-input" name="gender" value="Female" checked={form.gender === 'Female'} onChange={handleChange} />
              <label className="form-check-label">Female</label>
            </div>
          </div>

          <div className="col-md-12">
            <label className="form-label">Country</label>
            <select name="country_id" className="form-select" value={form.country_id} onChange={handleChange}>
              <option value="">Select Country</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>{country.name}</option>
              ))}
            </select>
          </div>

          <div className="col-12 d-flex justify-content-between mt-4">
            <button className="btn btn-success w-50 me-2" onClick={handleSignup}>Sign Up</button>
            {onClose && (
              <button className="btn btn-outline-secondary w-50" onClick={onClose}>Cancel</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
