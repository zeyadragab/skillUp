import { useState, useRef } from "react";
import { Camera, Upload, X, Check, Loader } from "lucide-react";
import { useUser } from "../context/UserContext";
import { authAPI } from "../../services/api";
import { toast } from "react-toastify";

const ProfilePictureUpload = ({ currentAvatar, onClose, onUpdate }) => {
  const { user, updateUser } = useUser();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(currentAvatar);
  const [uploading, setUploading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState("url"); // 'url' or 'file'
  const [avatarUrl, setAvatarUrl] = useState("");
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
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
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setAvatarUrl(url);
    if (url && isValidUrl(url)) {
      setPreview(url);
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

  const handleUpload = async () => {
    try {
      setUploading(true);

      let avatarToUpload = "";

      if (uploadMethod === "file" && selectedFile) {
        // Convert file to base64
        avatarToUpload = await convertToBase64(selectedFile);
      } else if (uploadMethod === "url" && avatarUrl) {
        // Use URL directly
        avatarToUpload = avatarUrl;
      } else {
        toast.error("Please select an image or provide a URL");
        setUploading(false);
        return;
      }

      // Update profile with new avatar
      const response = await authAPI.updateProfile({ avatar: avatarToUpload });

      if (response.success) {
        // Update user context
        await updateUser({ avatar: response.user.avatar });

        toast.success("Profile picture updated successfully!");

        if (onUpdate) {
          onUpdate(response.user.avatar);
        }

        if (onClose) {
          onClose();
        }
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast.error(error.message || "Failed to upload profile picture");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreview(currentAvatar);
    setAvatarUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 bg-white shadow-2xl rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Update Profile Picture
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Method Tabs */}
        <div className="flex mb-6 space-x-2">
          <button
            onClick={() => setUploadMethod("file")}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              uploadMethod === "file"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Upload className="inline-block w-4 h-4 mr-2" />
            Upload File
          </button>
          <button
            onClick={() => setUploadMethod("url")}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              uploadMethod === "url"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Camera className="inline-block w-4 h-4 mr-2" />
            Use URL
          </button>
        </div>

        {/* Preview */}
        <div className="mb-6">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <img
                src={
                  preview ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user?.name || "User"
                  )}&background=6366f1&color=fff&size=200`
                }
                alt="Preview"
                className="object-cover w-40 h-40 border-4 border-gray-200 shadow-lg rounded-2xl"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user?.name || "User"
                  )}&background=6366f1&color=fff&size=200`;
                }}
              />
              {(selectedFile || avatarUrl) && (
                <button
                  onClick={handleRemove}
                  className="absolute p-2 text-white transition-all bg-red-500 rounded-full shadow-lg -top-2 -right-2 hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Upload Method Content */}
        {uploadMethod === "file" ? (
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Choose Image
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-8 transition-all border-2 border-gray-300 border-dashed cursor-pointer rounded-xl hover:border-indigo-500 hover:bg-indigo-50"
            >
              <Upload className="w-12 h-12 mb-3 text-gray-400" />
              <p className="mb-1 text-sm font-medium text-gray-700">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to 5MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            {selectedFile && (
              <p className="mt-2 text-sm text-green-600">
                <Check className="inline-block w-4 h-4 mr-1" />
                {selectedFile.name}
              </p>
            )}
          </div>
        ) : (
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Image URL
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={handleUrlChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="mt-2 text-xs text-gray-500">
              Enter a direct link to your profile picture
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={
              uploading ||
              (uploadMethod === "file" && !selectedFile) ||
              (uploadMethod === "url" && !avatarUrl)
            }
            className="flex-1 px-4 py-3 font-medium text-white transition-all bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader className="inline-block w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureUpload;
