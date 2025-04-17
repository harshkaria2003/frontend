import { createContext, useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null); 
  const [countries, setCountries] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  // Experience State
  const [experiences, setExperiences] = useState([]);
  const [loadingExperiences, setLoadingExperiences] = useState(false);

  
  // Fetch all users
  useEffect(() => {
    fetchUsers(currentPage, searchTerm, usersPerPage);
  }, [searchTerm, currentPage, usersPerPage]);

  // Fetch countries
  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (selectedUser && selectedUser.id) {
      getExperiences(selectedUser.id);
    } else {
      setExperiences([]);
    }
  }, [selectedUser]);
  

  const fetchUsers = async (page = 1, search = "", limit = 5) => {
    try {
      const response = await axios.get("http://localhost:8000/crud.php", {
        params: { action: "getUsers", page, limit, search },
      });

      if (response.data.success) {
        setUsers(response.data.data);
        setTotalPages(response.data.totalPages > 0 ? response.data.totalPages : 1);
      } else {
        setUsers([]);
        setTotalPages(1);
        setMessage("No users found.");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setMessage("Error fetching users. Please try again.");
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await axios.get("http://localhost:8000/crud.php?action=getCountries");
      if (response.data.success) {
        setCountries(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  const getExperiences = async (userId) => {
    setLoadingExperiences(true);
    try {
      const response = await fetch(
        `http://localhost:8000/experience.php?action=getExperiences&user_id=${userId}`
      );
  
      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("❌ Server did not return valid JSON");
      }
  
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch experiences");
      }
  
      setExperiences(data.data || []);
    } catch (error) {
      console.error("❌ Error fetching experiences:", error);
      setExperiences([]);
    } finally {
      setLoadingExperiences(false);
    }
  };
  
  const addExperience = async (experience) => {
    try {
      const response = await fetch("http://localhost:8000/experience.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addExperience",
          experience, // ✅ This must match the backend expected key
        }),
      });
  
      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("❌ Server did not return valid JSON");
      }
  
      if (!response.ok || !data.success || !data.experience) {
        throw new Error(data.message || "Failed to add experience");
      }
  
      setExperiences((prev) => [...prev, data.experience]);
  
      return { success: true, experience: data.experience };
    } catch (error) {
      console.error("❌ Error adding experience:", error);
      return { success: false, message: error.message };
    }
  };
  
  const updateExperience = async (id, experience) => {
    try {
      const response = await fetch("http://localhost:8000/experience.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateExperience",
          experience_id: id,
          experience, 
        }),
      });
  
      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("❌ Server did not return valid JSON");
      }
  
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update experience");
      }
  
      setExperiences((prev) =>
        prev.map((exp) => (exp.id === id ? { ...exp, ...experience } : exp))
      );
  
      return { success: true };
    } catch (error) {
      console.error("❌ Error updating experience:", error);
      return { success: false, message: error.message };
    }
  };
  
  const removeExperience = async (id) => {
    try {
      const response = await fetch("http://localhost:8000/experience.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deleteExperience",
          experience_id: id,
        }),
      });
  
      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("❌ Server did not return valid JSON");
      }
  
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete experience");
      }
  
      setExperiences((prev) => prev.filter((exp) => exp.id !== id));
  
      return { success: true };
    } catch (error) {
      console.error("❌ Error deleting experience:", error);
      return { success: false, message: error.message };
    }
  };
  

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };
  


  const exportToCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(users);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "users.csv");
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(users);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "users.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const headers = Object.keys(users[0] || {});
    const rows = users.map(user => headers.map(h => user[h]));
    doc.autoTable({ head: [headers], body: rows });
    doc.save("users.pdf");
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        users,
        setUsers,
        countries,
        setCountries,
        message,
        selectedUser,
        setSelectedUser,
        fetchUsers,
        fetchCountries,
        currentPage,
        setCurrentPage,
        usersPerPage,
        setUsersPerPage,
        totalPages,
        searchTerm,
        setSearchTerm,
        theme,
        toggleTheme,
        experiences,
        getExperiences,
        addExperience,
        updateExperience,
        removeExperience,
        loadingExperiences,
        exportToCSV,
        exportToExcel,
        exportToPDF,
      }}
    >
      <div className={theme}>{children}</div>
    </UserContext.Provider>
  );
};

export default UserContext;
