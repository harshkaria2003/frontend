import { useContext } from "react";
import UserContext from "../context/UserContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; 

import * as XLSX from "xlsx";

const ExportButtons = () => {
  const { users } = useContext(UserContext);

  const exportCSV = () => {
    fetch("http://localhost:8000/export_users.php")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch CSV");
        return res.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "users_list.csv";
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch((err) => {
        console.error("CSV download failed:", err);
      });
  };
  
  

  const exportExcel = () => {
    // Map only the desired fields
    const filteredUsers = users.map(user => ({
      Name: `${user.first_name} ${user.last_name}`,
      Phone: user.phone,
      Email: user.email,
      Gender: user.gender,
      Education: user.education,
      Country: user.country_name || user.country || "-",
      Hobbies: user.hobbies,
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(filteredUsers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "users.xlsx");
  };
  

  const exportPDF = () => {
    if (!users.length) return;

    const doc = new jsPDF({ orientation: "landscape" });

    const headers = [
      [ "First Name", "Last Name", "Email", "Phone", "Gender", "Education", "Hobbies", "Country"]
    ];

    const data = users.map(user => [
    
      user.first_name,
      user.last_name,
      user.email,
      user.phone,
      user.gender,
      user.education,
      user.hobbies,
      user.country_name || user.country || "-"
    ]);

    doc.text("User Data", 14, 10);
    autoTable(doc, {
      startY: 15,
      head: headers,
      body: data,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [52, 58, 64] }
    });

    doc.save("users.pdf");
  };

  return (
    <div className="d-flex justify-content-end gap-2 mt-3">
      <button className="btn btn-outline-primary btn-sm" onClick={exportCSV}>Export CSV</button>
      <button className="btn btn-outline-success btn-sm" onClick={exportExcel}>Export Excel</button>
      <button className="btn btn-outline-danger btn-sm" onClick={exportPDF}>Export PDF</button>
    </div>
  );
};

export default ExportButtons;
