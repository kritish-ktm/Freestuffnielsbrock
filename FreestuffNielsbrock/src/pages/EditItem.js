// src/pages/EditItem.js
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";

function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    price: "0",
    description: "",
    category: "General",
    condition: "Good",
    location: "",
    whatsapp_number: "",
  });

  const [currentImage, setCurrentImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const categories = [
    "General",
    "Books",
    "Electronics",
    "Furniture",
    "Clothing",
    "Accessories",
    "Sports",
    "Other",
  ];

  const conditions = ["New", "Like New", "Good", "Fair", "Poor"];

  // Fetch existing item data
  useEffect(() => {
    const fetchItem = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("items")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        // Check if user is the owner
        if (data.posted_by !== user.id) {
          setMessage("❌ You don't have permission to edit this item");
          setMessageType("danger");
          setTimeout(() => navigate("/products"), 2000);
          return;
        }

        // Populate form with existing data
        setFormData({
          name: data.name || "",
          price: String(data.price || "0"),
          description: data.description || "",
          category: data.category || "General",
          condition: data.condition || "Good",
          location: data.location || "",
          whatsapp_number: data.whatsapp_number || "",
        });

        setCurrentImage(data.image);
        setImagePreview(data.image);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching item:", err);
        setMessage("❌ Failed to load item");
        setMessageType("danger");
        setLoading(false);
      }
    };

    fetchItem();
  }, [id, user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.description) {
      setMessage("⚠️ Please fill in the item name and description.");
      setMessageType("danger");
      return;
    }

    if (!user) {
      setMessage("⚠️ You must be logged in to edit an item.");
      setMessageType("danger");
      return;
    }

    setMessage("Updating item...");
    setMessageType("info");
    setUploading(true);

    try {
      let imageUrl = currentImage;

      // Upload new image if changed
      if (imageFile) {
        setMessage("Uploading new image...");
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('item-images')
          .upload(fileName, imageFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('item-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;

        // Optional: Delete old image if it exists
        if (currentImage) {
          const oldFileName = currentImage.split('/').pop();
          await supabase.storage
            .from('item-images')
            .remove([oldFileName]);
        }
      }

      // Update item in database
      setMessage("Saving changes...");
      const { error } = await supabase
        .from("items")
        .update({
          name: formData.name.trim(),
          price: Number(formData.price) || 0,
          description: formData.description.trim(),
          category: formData.category,
          condition: formData.condition,
          location: formData.location.trim() || "Niels Brock",
          whatsapp_number: formData.whatsapp_number.trim(),
          image: imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("posted_by", user.id); // Extra security check

      if (error) throw error;

      setMessage("✅ Item updated successfully! Redirecting...");
      setMessageType("success");

      setTimeout(() => navigate(`/product/${id}`), 1500);
    } catch (err) {
      console.error('Error updating item:', err);
      setMessage("❌ Failed to update item: " + err.message);
      setMessageType("danger");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="container my-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading item...</p>
      </div>
    );
  }

  return (
    <div className="container my-5" style={{ maxWidth: "700px" }}>
      <button
        className="btn btn-link mb-3 text-decoration-none"
        onClick={() => navigate(`/product/${id}`)}
        style={{ color: "#003087" }}
      >
        <i className="bi bi-arrow-left me-2"></i>
        Back to Item
      </button>

      <h2 className="text-center mb-4">
        <i className="bi bi-pencil-square me-2"></i>
        Edit Your Item
      </h2>

      {message && (
        <div className={`alert alert-${messageType} text-center`} role="alert">
          {message}
        </div>
      )}

      <div className="card shadow-lg border-0">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            {/* Item Name */}
            <div className="mb-3">
              <label htmlFor="name" className="form-label fw-bold">
                Item Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control form-control-lg"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Marketing Textbook"
                required
                disabled={uploading}
              />
            </div>

            {/* Category and Condition */}
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="category" className="form-label fw-bold">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  className="form-select form-select-lg"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={uploading}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label htmlFor="condition" className="form-label fw-bold">
                  Condition
                </label>
                <select
                  id="condition"
                  name="condition"
                  className="form-select form-select-lg"
                  value={formData.condition}
                  onChange={handleChange}
                  disabled={uploading}
                >
                  {conditions.map((cond) => (
                    <option key={cond} value={cond}>
                      {cond}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="mb-3">
              <label htmlFor="description" className="form-label fw-bold">
                Description <span className="text-danger">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                className="form-control"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide details about the item"
                rows="4"
                required
                disabled={uploading}
              ></textarea>
            </div>

            {/* Image Upload */}
            <div className="mb-3">
              <label htmlFor="image" className="form-label fw-bold">
                Item Image
              </label>
              <input
                type="file"
                id="image"
                className="form-control"
                accept="image/*"
                onChange={handleImageChange}
                disabled={uploading}
              />
              <small className="text-muted">
                Optional: Upload a new photo to replace the current one (Max 5MB)
              </small>
              {imagePreview && (
                <div className="mt-3">
                  <p className="small text-muted">
                    {imageFile ? "New image preview:" : "Current image:"}
                  </p>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="img-fluid rounded shadow-sm" 
                    style={{ maxWidth: "300px", maxHeight: "300px", objectFit: "cover" }}
                  />
                  {imageFile && (
                    <button
                      type="button"
                      className="btn btn-sm btn-danger mt-2 d-block"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(currentImage);
                      }}
                      disabled={uploading}
                    >
                      Cancel New Image
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Location */}
            <div className="mb-3">
              <label htmlFor="location" className="form-label fw-bold">
                Pickup Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                className="form-control"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Building A, Room 203"
                disabled={uploading}
              />
            </div>

            {/* WhatsApp Number */}
            <div className="mb-3">
              <label htmlFor="whatsapp_number" className="form-label fw-bold">
                WhatsApp Number <span className="text-danger">*</span>
              </label>
              <input
                type="tel"
                id="whatsapp_number"
                name="whatsapp_number"
                className="form-control"
                value={formData.whatsapp_number}
                onChange={handleChange}
                placeholder="e.g. +45 40 40 40 40"
                required
                disabled={uploading}
              />
            </div>

            {/* Price */}
            <div className="mb-3">
              <label htmlFor="price" className="form-label fw-bold">
                Price (DKK)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                className="form-control"
                value={formData.price}
                onChange={handleChange}
                min="0"
                disabled={uploading}
              />
              <small className="text-muted">
                Set to 0 for free items
              </small>
            </div>

            <div className="d-grid gap-2">
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-save me-2"></i>
                    Save Changes
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate(`/product/${id}`)}
                disabled={uploading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="alert alert-warning mt-4">
        <i className="bi bi-info-circle me-2"></i>
        <strong>Note:</strong> Changes will be visible immediately after saving.
      </div>
    </div>
  );
}

export default EditItem;