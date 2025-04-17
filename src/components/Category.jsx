import React, { useEffect, useState } from "react";
import axios from "axios";
import Carousel from "react-bootstrap/Carousel";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../styles/Categories.css"
import LoaderOverlay from './LoaderOverlay';  

const Category = () => {
  const [sliderImages, setSliderImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [itemForm, setItemForm] = useState({ id: null, name: "", price: "", images: [] });
  const [editItem, setEditItem] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [loading, setLoading] = useState(false);  // Loader state

  const showLoader = () => {
    setLoading(true);
  };
  
  const hideLoader = () => {
    setTimeout(() => {
      setLoading(false);
    }, 1800); 
  };
  

  useEffect(() => {
    fetchSliderImages();
    fetchCategoriesAndItems();
  }, []);


  const fetchSliderImages = async () => {
    showLoader();
    try {
      const res = await axios.get("http://localhost:8000/images.php?action=get_all");
      setSliderImages(res.data || []);
    } catch (err) {
      console.error("Slider fetch error:", err);
    } finally {
      hideLoader();
    }
  };

  
  const fetchCategoriesAndItems = async () => {
    showLoader();
    try {
      const res = await axios.get("http://localhost:8000/category_items.php?action=get_all");
      setCategories(res.data.categories || []);
      setItems(
        res.data.items ? res.data.items.map(item => ({ ...item, images: item.image ? item.image.split(',') : [] })) : []
      );
    } catch (err) {
      console.error("Fetch categories/items error:", err);
    } finally {
      hideLoader();
    }
  };

  // Add or update category
  const handleCategoryAddOrUpdate = async () => {
    if (!newCategory.trim()) return;
    showLoader();

    const formData = new FormData();
    formData.append("action", editCategoryId ? "update_category" : "add_category");
    formData.append("name", newCategory);
    if (editCategoryId) formData.append("id", editCategoryId);

    try {
      await axios.post("http://localhost:8000/category_items.php", formData);
      resetCategoryForm();
      fetchCategoriesAndItems();
      setShowCategoryModal(false);
    } catch (err) {
      console.error("Category save error:", err);
    } finally {
      hideLoader();
    }
  };

  // Reset the category form
  const resetCategoryForm = () => {
    setNewCategory("");
    setEditCategoryId(null);
  };

  // Delete category
  const handleCategoryDelete = async (id) => {
    showLoader();
    const formData = new FormData();
    formData.append("action", "delete_category");
    formData.append("id", id);

    try {
      await axios.post("http://localhost:8000/category_items.php", formData);
      fetchCategoriesAndItems();
    } catch (err) {
      console.error("Delete category error:", err);
    } finally {
      hideLoader();
    }
  };

  const handleItemImageChange = (e) => {
    const newFiles = Array.from(e.target.files);

    setItemForm((prevForm) => ({
      ...prevForm,
      images: [...prevForm.images, ...newFiles],
    }));

    // Generate preview URLs and append to existing previews
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setPreviewImages((prevPreviews) => [...prevPreviews, ...newPreviews]);
  };

  // Remove preview image
  const handleRemovePreviewImage = (index) => {
    if (!window.confirm("Are you sure you want to remove this image from preview?")) return;

    setItemForm((prevForm) => {
      const updatedImages = [...prevForm.images];
      updatedImages.splice(index, 1);
      return { ...prevForm, images: updatedImages };
    });

    setPreviewImages((prevPreviews) => {
      URL.revokeObjectURL(prevPreviews[index]);

      const updatedPreviews = [...prevPreviews];
      updatedPreviews.splice(index, 1);
      return updatedPreviews;
    });
  };

  // Submit item form (add or update)
  const handleItemSubmit = async (e) => {
    e.preventDefault();
    showLoader();

    const formData = new FormData();
    formData.append("category_id", selectedCategory);
    formData.append("name", itemForm.name);
    formData.append("price", itemForm.price);
    itemForm.images.forEach((image) => {
      formData.append("images[]", image);
    });
    formData.append("action", itemForm.id ? "update_item" : "add_item");
    if (itemForm.id) formData.append("id", itemForm.id);

    try {
      await axios.post("http://localhost:8000/category_items.php", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      resetItemForm();
      fetchCategoriesAndItems();
      setShowItemModal(false);
    } catch (err) {
      console.error("Item submit error:", err);
    } finally {
      hideLoader();
    }
  };

  // Reset item form
  const resetItemForm = () => {
    setItemForm({ id: "", name: "", price: "", images: [] });
    setPreviewImages([]);
    setSelectedCategory("");
    setEditItem(null);
  };

  // Delete item
  const handleItemDelete = async (id) => {
    showLoader();
    const formData = new FormData();
    formData.append("action", "delete_item");
    formData.append("id", id);

    try {
      await axios.post("http://localhost:8000/category_items.php", formData);
      fetchCategoriesAndItems();
    } catch (err) {
      console.error("Delete item error:", err);
    } finally {
      hideLoader();
    }
  };

  // Edit item
  const handleEditItem = (item) => {
    setSelectedCategory(item.category_id);
    setEditItem(item);
    setItemForm({ id: item.id, name: item.name, price: item.price, images: [] });
    setPreviewImages(item.images.map(img => `http://localhost:8000/uploads/Allitems/${img.trim()}`));
    setShowItemModal(true);
  };

  // Delete image from item
  const handleDeleteImage = async (itemId, imageName) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    showLoader();

    try {
      const formData = new FormData();
      formData.append("action", "delete_item_image");
      formData.append("item_id", itemId);
      formData.append("image_name", imageName);

      const response = await fetch("http://localhost:8000/category_items.php", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        alert("Image deleted successfully");

        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === itemId
              ? { ...item, images: item.images.filter((img) => img !== imageName) }
              : item
          )
        );

        setEditItem((prevEdit) => {
          if (!prevEdit || prevEdit.id !== itemId) return prevEdit;
          return {
            ...prevEdit,
            images: prevEdit.images.filter((img) => img !== imageName),
          };
        });
      } else {
        alert(`Failed to delete image: ${data.error}`);
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("Something went wrong while deleting the image.");
    } finally {
      hideLoader();
    }
  };

  
  
  
  return (
    
    <div>
   
   {loading && <LoaderOverlay />} 
       
     
      

      {/* IMAGE SLIDER */}
      <div className="slider-wrapper mb-3 rounded shadow overflow-hidden">
        
        <Carousel fade interval={3000}>
          {sliderImages.map((img, index) => (
            <Carousel.Item key={index}>
              <div className="slider-image-container">
                <img
                  className="d-block w-100 slider-image"
                  src={`http://localhost:8000/uploads/Allimages/${img.filename}`}
                  alt={`Slide ${index + 1}`}
                  style={{ maxHeight: '300px', objectFit: 'cover' }}
                />
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </div>


      
{/* CATEGORY & ITEM CONTROLS */}
<div className="mb-4 d-flex align-items-center">
  <button className="btn btn-primary" onClick={() => setShowCategoryModal(true)}>
    {editCategoryId ? "Edit" : "Add"} Category
  </button>
  {editCategoryId && (
    <button className="btn btn-secondary ms-2" onClick={resetCategoryForm}>
      Cancel
    </button>
  )}
</div>

<div className="mb-4 d-flex justify-content-end">
<button
  className="btn btn-success"
  onClick={() => {
    resetItemForm();       
    setEditItem(null);       
    setShowItemModal(true);  
  }}
>
  Add New Item
</button>

</div>

{/* CATEGORY + ITEMS */}
{categories.map((category) => (
  <div key={category.id} className="mb-5">
    <div className="d-flex justify-content-between align-items-center mb-2">
      <h4>{category.name}</h4>
      <div>
        <button
          className="btn btn-warning btn-sm me-2"
          onClick={() => {
            setEditCategoryId(category.id);
            setNewCategory(category.name);
            setShowCategoryModal(true);
          }}
        >
          Edit
        </button>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => handleCategoryDelete(category.id)}
        >
          Delete
        </button>
      </div>
    </div>

    <div className="row">
      {items
        .filter((item) => item.category_id === category.id)
        .map((item) => (
          <div className="col-md-4 mb-3" key={item.id}>
            <div className="card h-100 shadow-sm">
              {item.images && item.images.length > 0 ? (
                <Carousel fade interval={3000} controls={item.images.length > 1} indicators={item.images.length > 1}>
                  {item.images.map((image, index) => (
                    <Carousel.Item key={index}>
                      <img
                        className="d-block w-100"
                        src={`http://localhost:8000/uploads/Allitems/${image.trim()}`}
                        alt={`${item.name} - Image ${index + 1}`}
                        style={{ height: "200px", objectFit: "cover" }}
                      />
                    </Carousel.Item>
                  ))}
                </Carousel>
              ) : (
                <img
                  src="https://via.placeholder.com/200" 
                  className="card-img-top"
                  alt="No Image Available"
                  style={{ height: "200px", objectFit: "cover" }}
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{item.name}</h5>
                <p className="card-text">₹{item.price}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => handleEditItem(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleItemDelete(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  </div>
))} 

{/* CATEGORY MODAL */}
<div className={`modal fade ${showCategoryModal ? "show d-block" : ""}`} tabIndex="-1" style={{ display: showCategoryModal ? 'block' : 'none' }}>
  <div className="modal-dialog">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title">{editCategoryId ? "Edit" : "Add"} Category</h5>
        <button type="button" className="btn-close" onClick={() => setShowCategoryModal(false)}></button>
      </div>
      <div className="modal-body">
        <input
          className="form-control"
          placeholder="Enter Category Name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
      </div>
      <div className="modal-footer">
        <button
          className="btn btn-primary"
          onClick={handleCategoryAddOrUpdate}
        >
          {editCategoryId ? "Update" : "Add"} Category
        </button>
        <button className="btn btn-secondary" onClick={() => setShowCategoryModal(false)}>
          Cancel
        </button>
      </div>
    </div>
  </div>
</div>
{showCategoryModal && <div className="modal-backdrop fade show"></div>}



{/* ITEM MODAL */}
<div className={`modal fade ${showItemModal ? "show d-block" : ""}`} tabIndex="-1" style={{ display: showItemModal ? 'block' : 'none' }}>
  <div className="modal-dialog modal-lg">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title">{itemForm.id ? "Edit" : "Add"} Item</h5>
        <button type="button" className="btn-close" onClick={() => {
          setShowItemModal(false);
          resetItemForm();
        }}></button>
      </div>
      <form onSubmit={handleItemSubmit}>
        <div className="modal-body">
          {/* Category Selection */}
          <select
            className="form-select mb-2"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">-- Select Category --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Item Name Input */}
          <input
            className="form-control mb-2"
            placeholder="Item Name"
            value={itemForm.name}
            onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
          />

          {/* Price Input */}
          <input
            className="form-control mb-2"
            type="number"
            placeholder="Price"
            value={itemForm.price}
            onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
          />

          {/* Image Upload */}
          <div className="mb-3">
            <label htmlFor="itemImages" className="form-label">Add Images</label>
            <input
              className="form-control"
              type="file"
              id="itemImages"
              multiple
              onChange={handleItemImageChange}
            />
            {previewImages.length > 0 && !editItem && (
              <div className="mt-2">
                <h6>Image Preview:</h6>
                <div className="d-flex flex-wrap">
                  {previewImages.map((imgSrc, index) => (
                    <div key={index} className="position-relative me-2 mb-2">
                      <img src={imgSrc} alt={`Preview ${index}`} style={{ height: '80px', width: '80px', objectFit: 'cover' }} />
                      <button
                        type="button"
                        className="btn-close btn-sm position-absolute top-0 start-100 translate-middle"
                        onClick={() => handleRemovePreviewImage(index)}
                        aria-label="Remove"
                      ></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Current Images for Edit */}
          {editItem && editItem.images && editItem.images.length > 0 && (
            <div className="mt-3">
              <h6>Current Images:</h6>
              <div className="d-flex flex-wrap">
                {editItem.images.map((img, index) => (
                  <div key={index} className="position-relative me-2 mb-2">
                    <img
                      src={`http://localhost:8000/uploads/Allitems/${img.trim()}`}
                      alt={`Current Item ${index}`}
                      style={{ height: '80px', width: '80px', objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      className="btn btn-danger btn-sm position-absolute top-0 start-100 translate-middle"
                      onClick={() => handleDeleteImage(editItem.id, img.trim())}
                      aria-label="Delete Image"
                      style={{ borderRadius: '50%', padding: '0.2rem', lineHeight: '0.8' }}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-success me-2" type="submit">
            {itemForm.id ? "Update Item" : "Save Item"}
          </button>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => {
              setShowItemModal(false);
              resetItemForm();
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
{showItemModal && <div className="modal-backdrop fade show"></div>}




    </div>  
  );
};

export default Category;