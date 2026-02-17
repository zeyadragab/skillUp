import React, { memo, useState, useRef } from "react";
import { X, Upload, Camera, Loader, Check } from "lucide-react";
import { useUser } from "../../context/UserContext";
import { toast } from "react-toastify";

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Netherlands",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "India",
  "China",
  "Japan",
  "South Korea",
  "Brazil",
  "Mexico",
  "Argentina",
  "Egypt",
  "South Africa",
  "Nigeria",
  "Kenya",
  "Other",
];

const EditProfileModal = memo(({ user, onClose }) => {
  const { updateUser } = useUser();
  const [saving, setSaving] = useState(false);
  const [uploadMethod, setUploadMethod] = useState("file"); // 'file' or 'url'
  const fileInputRef = useRef(null);

  // Initialize form data from user object
  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    country: user?.country || "",
    languages: Array.isArray(user?.languages)
      ? user.languages.join(", ")
      : user?.languages || "",
    avatar: user?.avatar || "",
  });

  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setAvatarUrl(url);
    if (url && isValidUrl(url)) {
      setAvatarPreview(url);
    }
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleRemoveAvatar = () => {
    setSelectedFile(null);
    setAvatarUrl("");
    setAvatarPreview(user?.avatar || "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (formData.bio && formData.bio.length > 500) {
      toast.error("Bio must be less than 500 characters");
      return;
    }

    try {
      setSaving(true);

      // Prepare update data
      const updates = {
        name: formData.name.trim(),
        bio: formData.bio.trim(),
        country: formData.country,
        languages: formData.languages
          .split(",")
          .map((lang) => lang.trim())
          .filter((lang) => lang.length > 0),
      };

      // Handle avatar update if changed
      if (uploadMethod === "file" && selectedFile) {
        // Convert file to base64
        updates.avatar = await convertToBase64(selectedFile);
      } else if (uploadMethod === "url" && avatarUrl) {
        // Use URL directly
        updates.avatar = avatarUrl;
      }

      // Update profile
      const response = await updateUser(updates);

      if (response.success) {
        toast.success("Profile updated successfully!");
        onClose();
      } else {
        toast.error(response.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            disabled={saving}
            className="p-2 text-gray-400 transition-colors rounded-lg hover:text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Profile Picture Section */}
          <div>
            <label className="block mb-4 text-sm font-semibold text-gray-700">
              Profile Picture
            </label>

            {/* Avatar Preview */}
            <div className="flex items-center gap-6 mb-4">
              <div className="relative">
                <img
                  src={
                    avatarPreview ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      formData.name || "User"
                    )}&background=6366f1&color=fff&size=128`
                  }
                  alt="Preview"
                  className="object-cover w-24 h-24 border-4 border-gray-200 rounded-full"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      formData.name || "User"
                    )}&background=6366f1&color=fff&size=128`;
                  }}
                />
                {(selectedFile || avatarUrl) && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="absolute p-1 text-white transition-all bg-red-500 rounded-full shadow-lg -top-1 -right-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Upload Method Tabs */}
              <div className="flex-1">
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setUploadMethod("file")}
                    className={`flex-1 px-3 py-2 text-sm rounded-lg font-medium transition-all ${
                      uploadMethod === "file"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Upload className="inline-block w-4 h-4 mr-1" />
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMethod("url")}
                    className={`flex-1 px-3 py-2 text-sm rounded-lg font-medium transition-all ${
                      uploadMethod === "url"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Camera className="inline-block w-4 h-4 mr-1" />
                    Use URL
                  </button>
                </div>

                {uploadMethod === "file" ? (
                  <>
                    <label className="inline-flex items-center px-4 py-2 space-x-2 font-medium text-indigo-600 transition-colors rounded-lg cursor-pointer bg-indigo-50 hover:bg-indigo-100">
                      <Upload className="w-4 h-4" />
                      <span>Choose Photo</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                    {selectedFile && (
                      <p className="mt-2 text-sm text-green-600">
                        <Check className="inline-block w-4 h-4 mr-1" />
                        {selectedFile.name}
                      </p>
                    )}
                  </>
                ) : (
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={handleUrlChange}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                )}
                <p className="mt-2 text-xs text-gray-500">
                  JPG, PNG or GIF (max 5MB)
                </p>
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Your full name"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Tell others about yourself..."
            />
            <p className="mt-2 text-xs text-gray-500">
              {formData.bio.length}/500 characters
            </p>
          </div>

          {/* Country */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Country
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select a country</option>
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          {/* Languages */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Languages
            </label>
            <input
              type="text"
              name="languages"
              value={formData.languages}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g., English, Spanish, French"
            />
            <p className="mt-2 text-xs text-gray-500">
              Separate languages with commas
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-3 font-medium text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-3 font-medium text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader className="inline-block w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

EditProfileModal.displayName = "EditProfileModal";

export default EditProfileModal;
