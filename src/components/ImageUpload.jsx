import { useState } from "react";
import "../styles/ImageUpload.css";

const ImageUpload = () => {
  const [file, setFile] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(selectedFile.type)) {
      setMessage("Invalid file type. Please upload a JPG, PNG, or GIF.");
      return; 
    }

    setFile(selectedFile);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select an image");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("http://localhost:8000/upload.php", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("Upload Response:", result);

      if (result.success) {
        setMessage("Upload successful!");
        setImageURL(result.url);
      } else {
        setMessage(result.error);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setMessage("Error uploading image");
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload Image</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      <p className="message">{message}</p>
      {imageURL && <img src={imageURL} alt="Uploaded" className="preview-img" />}
    </div>
  );
};

export default ImageUpload;


