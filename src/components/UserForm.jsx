import { useState, useEffect, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Modal } from "react-bootstrap";
import ExperienceForm from "./ExperienceForm";
import { useNavigate } from "react-router-dom";
import UserContext from "../context/UserContext";
import ExportButtons from "./ExportButtons"; 




const UserForm = () => {
  const {
    users,
    fetchUsers,
    experiences,
    getExperiences,
    updateExperience,
    removeExperience,
    countries,
    fetchCountries,
    setSelectedUser,
    selectedUser,
    totalPages,
    setUser
    
  } = useContext(UserContext); 

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    gender: "",
    education: "",
    hobbies: [],
    country_id: "",
  });


  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(5);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showAddExperienceForm, setShowAddExperienceForm] = useState(false);
  const [loadingExperiences, setLoadingExperiences] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState(null); // 


  const navigate = useNavigate();

  useEffect(() => {
    fetchCountries();
  }, []);

 

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchUsers(currentPage, searchTerm, usersPerPage);
    }, 500);
    return () => clearTimeout(delaySearch);
  }, [searchTerm, currentPage, usersPerPage]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        hobbies: checked
          ? [...prev.hobbies, value]
          : prev.hobbies.filter((h) => h !== value),
      }));
    } else {
      setFormData({
        ...formData,
        [name]: name === "country_id" ? Number(value) : value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = editingId ? "updateUser" : "addUser";
    const dataToSend = { ...formData, id: editingId };

    try {
      const response = await fetch(
        `http://localhost:8000/crud.php?action=${action}`,
        {
          method: "POST",
          body: JSON.stringify(dataToSend),
        }
      );
      const data = await response.json();
      setMessage(data.message);
      fetchUsers(currentPage, searchTerm, usersPerPage);
      setShowForm(false);
      resetForm();
    } catch {
      setMessage("Error submitting form");
    }
  };

  const handleEdit = (user) => {
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      email: user.email,
      gender: user.gender,
      education: user.education,
      country_id: user.country_id ? Number(user.country_id) : "",
      hobbies: user.hobbies ? user.hobbies.split(",") : [],
    });
    setEditingId(user.id);
    setShowForm(true);
    setSelectedUser(user);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        "http://localhost:8000/crud.php?action=deleteUser",
        {
          method: "POST",
          body: JSON.stringify({ id }),
        }
      );
      const data = await response.json();
      setMessage(data.message);
      fetchUsers(currentPage, searchTerm, usersPerPage);
    } catch {
      setMessage("Error deleting user");
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
      gender: "",
      country_id: "",
      education: "",
      hobbies: [],
    });
    setEditingId(null);
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:8000/logout.php", {
        method: "POST",
        credentials: "include",
      });
      const result = await res.json();
      if (result.success) {
        setUser(null); // make sure setUser is available from context
        navigate("/login");
      } else {
        alert("Logout failed.");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchUsers(newPage, searchTerm, usersPerPage); 
    }
  };
  
  const handleLimitChange = (e) => {
    const newLimit = Number(e.target.value);
    setUsersPerPage(newLimit);
    setCurrentPage(1);
    fetchUsers(1, searchTerm, newLimit); 
  };

  const handleViewProfile = (user) => {
    if (!user) return; 
    
    const selectedCountry = countries.find((c) => Number(c.id) === Number(user.country_id));
    
    if (selectedUser?.id !== user.id) { 
      setSelectedUser({
        ...user,
        country: selectedCountry ? selectedCountry.name : "Not Available",
      });
      navigate(`/profile/${user.id}`);
    }
  };
  
  useEffect(() => {
    if (countries.length > 0 && selectedUser?.id) {
      handleViewProfile(selectedUser);
    }
   
  }, [countries]);



  const handleShowExperience = (user) => {
    if (!user?.id) {
      console.error("❌ Invalid user or missing user ID!");
      return;
    } 
    setSelectedUser(user);        
    setShowExperienceModal(true);  
  };
  
 
  useEffect(() => {
    if (showExperienceModal && selectedUser?.id) {
      getExperiences(selectedUser.id);
    }
  }, [showExperienceModal, selectedUser?.id]); // 🔁 track user ID, not object (prevents duplicate calls)
  
  // Close Experience Modal
  const handleCloseExperience = () => {
    setShowExperienceModal(false);
    setShowAddExperienceForm(false);
  };
  
  // Used when clicking on a user row/card/etc
  const handleSelectUser = (user) => {
    if (!user?.id) {
      console.error("❌ Invalid user selected:", user);
      return;
    }
  
    setSelectedUser(user);
    getExperiences(user.id); 
  };
  
  
  const currentUsers = users   








  return (
    <div className="container mt-5">
      
      
     
      
      

      <h2 className="text-center mb-4">User Management</h2>
      {message && <div className="alert alert-info">{message}</div>}

      <input
  type="text"
  placeholder="Search users..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}  
  className="form-control mb-3"
/>




      <button
        className="btn btn-success mb-3"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "Close Form" : "Add User"}
      </button>

      <div className="container">
      {/* ✅ Show export buttons here */}
      <ExportButtons />

      {/* Your other UI code here, e.g., form, user table, etc. */}
    </div>
    <button className="btn btn-danger" onClick={handleLogout}>
          Logout
        </button>
    
   
     
    
      {showForm && (
        <form onSubmit={handleSubmit} className="card p-4 shadow">
          <div className="user-form">
            <div className="mb-3">
              <label className="form-label">First Name:</label>
              <input
                type="text"
                name="first_name"
                className="form-control"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Last Name:</label>
              <input
                type="text"
                name="last_name"
                className="form-control"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Phone:</label>
              <input
                type="text"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
                required
              />

    <div className="mb-3">
          <label className="form-label">Email:</label>
      <input
    type="email"
    name="email"
    className="form-control"
    value={formData.email}
    onChange={handleChange}
    required
            />
          </div>
            </div>
            <div className="mb-3">
            <label className="form-label">Gender:</label>
            <select
              name="gender"
              className="form-control"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Education:</label>
            <select
              name="education"
              className="form-control"
              value={formData.education}
              onChange={handleChange}
              required
            >
              <option value="">Select Education</option>
              <option value="High School">High School</option>
              <option value="Bachelor">Bachelor</option>
              <option value="Master">Master</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label d-block">Hobbies:</label>
            {['Reading', 'Gaming', 'Sports', 'Music'].map((hobby) => (
              <div key={hobby} className="form-check">
                <input
                  type="checkbox"
                  name="hobbies"
                  value={hobby}
                  className="form-check-input"
                  checked={formData.hobbies.includes(hobby)}
                  onChange={handleChange}
                />
                <label className="form-check-label">{hobby}</label>
              </div>
            ))}
          </div>



            <div className="mb-3">
              <label className="form-label">Country:</label>
              <select
                name="country_id"
                className="form-control"
                value={formData.country_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>



          <button type="submit" className="btn btn-primary">
            {editingId ? "Update" : "Submit"}
          </button>
        </form>
      )}


      <h3 className="text-center mt-4">Users List</h3>
      
     {/* Users Table */}
     <table className="table table-striped mt-3">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Gender</th>
            <th>Education</th>
            <th>Country</th>
            <th>Hobbies</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.length > 0 ? (
            currentUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.first_name} {user.last_name}</td>
                <td>{user.phone}</td>
                <td>{user.email}</td>
                <td>{user.gender}</td>
                <td>{user.education}</td>
                <td>
                  {countries.length > 0
                    ? countries.find((country) => Number(country.id) === Number(user.country_id))?.name || "Unknown"
                    : "Loading..."}
                </td>
                <td>{user.hobbies}</td>
                <td>
                <Button
  variant="info"
  onClick={() => handleShowExperience(user)} // pass the actual user object here
>
  View Experience
</Button>

                <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(user)}>
  Edit
</button>

<button className="btn btn-danger btn-sm" onClick={() => handleDelete(user.id)}>
  Delete
</button>

<button className="btn btn-primary" onClick={() => handleViewProfile(user)}>
  View Profile
</button>





                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">No users found</td>
            </tr>
          )}
        </tbody>
      </table>
{/* Experience Modal */}
<Modal show={showExperienceModal} onHide={handleCloseExperience} centered size="lg">
  <Modal.Header closeButton>
    <Modal.Title>User Experiences</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {!showAddExperienceForm ? (
      <>
        {/* Display Experiences */}
        {loadingExperiences ? (
          <p>Loading experiences...</p>
        ) : experiences.length > 0 ? (
          <div className="list-group">
            {experiences.map((exp) => (
              <div key={exp.id} className="list-group-item mb-3 border rounded p-3 shadow-sm">
                <h5 className="mb-1">{exp.job_title}</h5>
                <p className="mb-1">
                  <strong>Company:</strong> {exp.company_name}
                </p>
                <p className="mb-1">
                  <strong>Start Date:</strong> {exp.start_date} <br />
                  <strong>End Date:</strong> {exp.end_date || "Present"}
                </p>
                <p className="mb-1">
                  <strong>Years of Experience:</strong> {exp.years_of_experience}
                </p>
                {exp.description && (
                  <p className="mb-1">
                    <strong>Description:</strong> {exp.description}
                  </p>
                )}

                <div className="mt-3">
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => {
                      setSelectedExperience(exp);
                      setShowAddExperienceForm(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => removeExperience(exp.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No experiences found.</p>
        )}

        {/* Add Experience Button */}
        <Button
          variant="success"
          className="mt-3"
          onClick={() => {
            setSelectedExperience(null); 
            setShowAddExperienceForm(true);
          }}
        >
          Add Experience
        </Button>
      </>
    ) : (
      <ExperienceForm
        show={true}
        onClose={() => {
          setShowAddExperienceForm(false);
          setSelectedExperience(null);
        }}
        editingExperience={selectedExperience}
      />
    )}
  </Modal.Body>
</Modal>




      {totalPages > 1 && (
  <div className="d-flex justify-content-center align-items-center mt-3">
    {/* Previous Button */}
    <button
      className="btn btn-outline-primary mx-2"
      onClick={() => handlePageChange(currentPage - 1)} 
      disabled={currentPage === 1}
    >
      &lt;
    </button>

    {/* Page Numbers */}
    {Array.from({ length: totalPages }, (_, index) => (
      <button
        key={index}
        className={`btn mx-1 ${
          currentPage === index + 1 ? "btn-primary text-white" : "btn-outline-secondary"
        }`}
        onClick={() => handlePageChange(index + 1)} 
      >
        {index + 1}
      </button>
    ))}

    {/* Next Button */}
    <button
      className="btn btn-outline-primary mx-2"
      disabled={currentPage === totalPages}
    >
      &gt;
    </button>

    {/* Users Per Page Dropdown */}
    <select
      onChange={handleLimitChange} 
      className="form-select w-auto ms-3"
    >
      {[5, 10, 15, 20].map((limit) => (
        <option key={limit} value={limit}>
          Show {limit}
        </option>
      ))}
    </select>
  </div>
)}

    </div>
   
  );
 
}



export default UserForm;
