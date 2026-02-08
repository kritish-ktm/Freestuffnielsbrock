// src/pages/PostItem.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";

function PostItem() {
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

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
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

    if (!imageFile) {
      setMessage("⚠️ Please upload an image for your item. An image is required!");
      setMessageType("danger");
      return;
    }

    if (!user) {
      setMessage("⚠️ You must be logged in to post an item.");
      setMessageType("danger");
      return;
    }

    setMessage("Posting item...");
    setMessageType("info");
    setUploading(true);

    try {
      let imageUrl = null;

      // Upload image (now required)
      setMessage("Uploading image...");
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('item-images')
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Image upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('item-images')
        .getPublicUrl(fileName);

      imageUrl = publicUrl;
      console.log('Image uploaded:', imageUrl);

      // Calculate expiry date (60 days from now)
      const now = new Date();
      const expiryDate = new Date(now.getTime() + (60 * 24 * 60 * 60 * 1000)); // 60 days in milliseconds

      // Insert item into database
      setMessage("Saving item...");
      const { data, error } = await supabase
        .from("items")
        .insert([
          {
            name: formData.name.trim(),
            price: Number(formData.price) || 0,
            description: formData.description.trim(),
            category: formData.category,
            condition: formData.condition,
            location: formData.location.trim() || "Niels Brock",
            whatsapp_number: formData.whatsapp_number.trim(),
            image: imageUrl,
            posted_by: user.id,
            posted_by_email: user.email,
            posted_by_name: user.user_metadata?.full_name || user.email?.split('@')[0] || "Anonymous",
            created_at: new Date().toISOString(),
            expiry_date: expiryDate.toISOString(), // ← ADD 60-DAY EXPIRY
            status: 'active', // ← EXPLICITLY SET STATUS
          },
        ])
        .select();

      if (error) throw error;

      setMessage("✅ Item posted successfully! It will expire in 60 days. Redirecting...");
      setMessageType("success");

      // Reset form
      setFormData({
        name: "",
        price: "0",
        description: "",
        category: "General",
        condition: "Good",
        location: "",
        whatsapp_number: "",
      });
      setImageFile(null);
      setImagePreview(null);

      setTimeout(() => navigate("/products"), 2000);
    } catch (err) {
      console.error('Error posting item:', err);
      setMessage("❌ Failed to post item: " + err.message);
      setMessageType("danger");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container my-5" style={{ maxWidth: "700px" }}>
      <h2 className="text-center mb-4">
        <i className="bi bi-plus-circle me-2"></i>
        Post a Free Item
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
                placeholder="Provide details about the item, its condition, and why you're giving it away"
                rows="4"
                required
                disabled={uploading}
              ></textarea>
            </div>

            {/* Image Upload - REQUIRED */}
            <div className="mb-3">
              <label htmlFor="image" className="form-label fw-bold">
                Item Image <span className="text-danger">*</span>
              </label>
              <input
                type="file"
                id="image"
                className="form-control"
                accept="image/*"
                onChange={handleImageChange}
                disabled={uploading}
                required
              />
              <small className="text-muted">
                Required: Upload a photo of your item (Max 5MB)
              </small>
              {imagePreview && (
                <div className="mt-3">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="img-fluid rounded shadow-sm" 
                    style={{ maxWidth: "300px", maxHeight: "300px", objectFit: "cover" }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-danger mt-2 d-block"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    disabled={uploading}
                  >
                    Remove Image
                  </button>
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
              <small className="text-muted">
                Optional: Where can people pick up the item?
              </small>
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
              <small className="text-muted">
                Required: Your WhatsApp number for interested buyers to contact you
              </small>
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
                Set to 0 for free items (recommended)
              </small>
            </div>

            <button
              type="submit"
              className="btn btn-success btn-lg w-100 mt-3"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Posting...
                </>
              ) : (
                <>
                  <i className="bi bi-upload me-2"></i>
                  Post Item
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Tips Section */}
      <div className="alert alert-info mt-4">
        <h6 className="alert-heading">
          <i className="bi bi-lightbulb me-2"></i>
          Tips for posting
        </h6>
        <ul className="mb-0">
          <li>Be honest about the item's condition</li>
          <li>Upload a clear, well-lit photo of the item</li>
          <li>Provide clear pickup instructions</li>
          <li>Respond quickly to interested people</li>
          <li><strong>Items expire after 60 days automatically</strong></li>
        </ul>
      </div>
    </div>
  );
}

export default PostItem;