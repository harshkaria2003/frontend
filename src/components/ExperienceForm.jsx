import { useContext, useState, useEffect } from "react";
import { Button, Modal, Form, Alert, Spinner } from "react-bootstrap";
import UserContext from "../context/UserContext";
import "bootstrap/dist/css/bootstrap.min.css";

const ExperienceForm = ({ show, onClose, editingExperience }) => {
  const { addExperience, updateExperience, selectedUser } = useContext(UserContext);

  const initialFormState = {
    id: "",
    job_title: "",
    company_name: "",
    years_of_experience: "",
    start_date: "",
    end_date: "",
    description: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedUser?.id) {
      setError("⚠️ Please select a user first!");
      return;
    }

    setError("");
    setMessage("");

    if (editingExperience) {
      setFormData({
        ...editingExperience,
        years_of_experience: editingExperience.years_of_experience?.toString() || "",
      });
    } else {
      setFormData(initialFormState);
    }
  }, [show, editingExperience, selectedUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedUser?.id) {
      setError("⚠️ Please select a user first!");
      return;
    }

    const { job_title, company_name, years_of_experience, start_date, end_date } = formData;

    // Required fields
    if (!job_title.trim() || !company_name.trim() || !start_date) {
      setError("⚠️ Job title, company name, and start date are required!");
      return;
    }

    // Optional date check
    if (end_date && new Date(start_date) > new Date(end_date)) {
      setError("⚠️ End date cannot be before the start date.");
      return;
    }

    const experienceData = {
      ...formData,
      id: formData.id ? parseInt(formData.id, 10) : undefined,
      user_id: selectedUser.id,
      job_title: job_title.trim(),
      company_name: company_name.trim(),
      description: formData.description?.trim() || "",
      end_date: end_date?.trim() || "",
      years_of_experience: parseInt(years_of_experience || 0, 10),
    };

    setError("");
    setLoading(true);

    try {
      const response = formData.id
        ? await updateExperience(experienceData.id, experienceData)
        : await addExperience(experienceData);

      if (!response.success) {
        throw new Error(response.message || "Operation failed");
      }

      setMessage("✅ Experience saved successfully!");

      setTimeout(() => {
        setMessage("");
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
      setError(`❌ ${err.message || "Error saving experience. Please try again."}`);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{formData.id ? "Edit Experience" : "Add Experience"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {message && <Alert variant="success">{message}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-2">
            <Form.Label>Job Title</Form.Label>
            <Form.Control
              type="text"
              name="job_title"
              value={formData.job_title}
              onChange={handleChange}
              required
              placeholder="Enter job title"
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Company Name</Form.Label>
            <Form.Control
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              required
              placeholder="Enter company name"
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Years of Experience</Form.Label>
            <Form.Control
              type="number"
              name="years_of_experience"
              value={formData.years_of_experience}
              onChange={handleChange}
              placeholder="Enter experience in years"
              min="0"
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>End Date</Form.Label>
            <Form.Control
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter responsibilities or achievements"
              rows={3}
            />
          </Form.Group>

          <div className="d-flex justify-content-between mt-3">
            <Button type="submit" variant="success" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : "Save Experience"}
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ExperienceForm;
