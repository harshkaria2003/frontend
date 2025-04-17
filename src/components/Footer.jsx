import { useContext } from "react";
import UserContext from "../context/UserContext";
import "../styles/Footer.css";

const Footer = () => {
  const { theme } = useContext(UserContext);

  return (
    <footer className={`footer ${theme}`}>
      <p>&copy;  all rights reserved by harsh karia @2025</p>
    </footer>
  );
};

export default Footer;
