import React, { useRef, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UserContext from "../context/UserContext";

const Userprofile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users, countries, setUsers } = useContext(UserContext);

  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const [message, setMessage] = useState("");
  const user = users.find((u) => u.id === Number(id));

  if (!user) {
    return (
      <div className="container mt-5 text-center">
        <h3 className="text-danger">No data available</h3>
        <button className="btn btn-primary" onClick={() => navigate("/users")}>
          Back to Users
        </button>
      </div>
    );
  }

  const selectedCountry = countries.find(
    (c) => Number(c.id) === Number(user.country_id)
  );

  const handleUpload = async (file, type) => {
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setMessage("Invalid file type");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("user_id", user.id);
    formData.append("type", type);

    try {
      const res = await fetch("http://localhost:8000/upload.php", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (result.success) {
        setMessage("Image uploaded!");

        const updatedUsers = users.map((u) =>
          u.id === user.id
            ? {
                ...u,
                ...(type === "profile"
                  ? { profile_picture: result.file }
                  : { cover_image: result.file }),
              }
            : u
        );
        setUsers(updatedUsers);
      } else {
        setMessage(result.error || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error uploading image");
    }
  };

  return (
    <div className="container mt-4">
   
      <div className="cover-wrapper position-relative mb-5">
        {user.cover_image ? (
          <img
            src={`http://localhost:8000/uploads/${user.cover_image}`}
            alt="Cover"
            className="w-100 rounded"
            style={{
              height: "250px",
              objectFit: "cover",
              cursor: "pointer",
            }}
            onClick={() => coverInputRef.current.click()}
            title="Click to change cover image"
          />
        ) : (
          <div
            className="w-100 rounded"
            style={{
              height: "250px",
              backgroundColor: "#fff",
              border: "1px solid #ddd",
              cursor: "pointer",
            }}
            onClick={() => coverInputRef.current.click()}
            title="Click to upload cover image"
          />
        )}
        <input
          type="file"
          ref={coverInputRef}
          accept="image/*"
          onChange={(e) => handleUpload(e.target.files[0], "cover")}
          style={{ display: "none" }}
        />

        {/* Profile Picture Overlapping */}
        <div
          className="position-absolute translate-middle"
          style={{
            bottom: "-60px",
            left: "50%",
          }}
        >
          <img
            src={
              user.profile_picture
                ? `http://localhost:8000/uploads/${user.profile_picture}`
                : "https://via.placeholder.com/150"
            }
            alt="Profile"
            className="rounded-circle border border-white shadow"
            style={{
              width: "120px",
              height: "120px",
              objectFit: "cover",
              cursor: "pointer",
            }}
            onClick={() => profileInputRef.current.click()}
            title="Click to change profile picture"
          />
          <input
            type="file"
            ref={profileInputRef}
            accept="image/*"
            onChange={(e) => handleUpload(e.target.files[0], "profile")}
            style={{ display: "none" }}
          />
        </div>
      </div>

      {/* User Info */}
      <div className="text-center" style={{ marginTop: "80px" }}>
        <h3>
          {user.first_name} {user.last_name}
        </h3>
        {message && <p className="text-muted">{message}</p>}
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Phone:</strong> {user.phone}</p>
        <p><strong>Gender:</strong> {user.gender}</p>
        <p><strong>Education:</strong> {user.education}</p>
        <p><strong>Country:</strong> {selectedCountry?.name || "N/A"}</p>
        <p><strong>Hobbies:</strong> {user.hobbies?.toString() || "None"}</p>

        <button className="btn btn-secondary mt-3" onClick={() => navigate("/users")}>
          Back to Users
        </button>
      </div>
    </div>
  );
};

export default Userprofile;
