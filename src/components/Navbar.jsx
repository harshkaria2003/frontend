import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import UserContext from "../context/UserContext";
import "../styles/Navbar.css";

const Navbar = () => {
  const { theme, toggleTheme } = useContext(UserContext);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed.user || parsed);
    }
  }, []);

  return (
    <nav className={`navbar ${theme}`}>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/contact">Contact</Link></li>
        
        {user?.role_type === 'admin' && (
          <>
            <li><Link to="/users">Users</Link></li>
            <li><Link to="/settings">Settings</Link></li>
          </>
        )}
      </ul>
      <button onClick={toggleTheme}> Theme</button>
    </nav>
  );
};

export default Navbar;
