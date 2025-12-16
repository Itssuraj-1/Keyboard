// frontend/src/components/blog/BlogForm.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { blogsAPI } from "../../api/blogs";
import Input from "../common/Input";
import Button from "../common/Button";
import RichTextEditor from "../common/RichTextEditor";
import { Upload, X, Save, Send } from "lucide-react";

/**
 * Blog create/edit form component with draft/publish options
 */
const BlogForm = ({ blogId = null, initialData = null }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });
  const [coverImage, setCoverImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [status, setStatus] = useState(initialData?.status || "published");

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        content: initialData.content,
      });
      setPreviewUrl(initialData.coverImage);
      setStatus(initialData.status);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setApiError("");
  };

  const handleContentChange = (content) => {
    setFormData((prev) => ({ ...prev, content }));
    if (errors.content) {
      setErrors((prev) => ({ ...prev, content: "" }));
    }
    setApiError("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          coverImage: "Please select a valid image file",
        }));
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          coverImage: "Image size must be less than 5MB",
        }));
        return;
      }

      setCoverImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, coverImage: "" }));
    }
  };

  const removeImage = () => {
    setCoverImage(null);
    setPreviewUrl(initialData?.coverImage || "");
  };

  const validate = (isDraft = false) => {
    const newErrors = {};

    // For drafts, only require title
    if (!formData.title || formData.title.trim().length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    } else if (formData.title.trim().length > 200) {
      newErrors.title = "Title cannot exceed 200 characters";
    }

    // For publish, require content
    if (!isDraft) {
      // Strip HTML tags for length validation
      const textContent = formData.content.replace(/<[^>]*>/g, '').trim();
      if (!textContent || textContent.length < 20) {
        newErrors.content = "Content must be at least 20 characters";
      }

      if (!blogId && !coverImage) {
        newErrors.coverImage = "Please upload a cover image";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (publishStatus) => {
    const isDraft = publishStatus === "draft";

    if (!validate(isDraft)) return;

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title.trim());
      formDataToSend.append("content", formData.content);
      formDataToSend.append("status", publishStatus);

      if (coverImage) {
        formDataToSend.append("coverImage", coverImage);
      }

      let response;
      if (blogId) {
        response = await blogsAPI.updateBlog(blogId, formDataToSend);
      } else {
        response = await blogsAPI.createBlog(formDataToSend);
      }

      // Redirect based on status
      if (publishStatus === "draft") {
        navigate("/my-blogs");
      } else {
        navigate(`/blog/${response.data._id}`);
      }
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to save blog");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6">
      {apiError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {apiError}
        </div>
      )}

      {/* Status Badge */}
      {blogId && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Current Status:</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              status === "published"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {status === "published" ? "Published" : "Draft"}
          </span>
        </div>
      )}

      {/* Title */}
      <Input
        label="Blog Title"
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        placeholder="Enter blog title"
        required
        maxLength={200}
      />

      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Cover Image <span className="text-red-500">*</span>
        </label>

        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Cover preview"
              className="w-full h-64 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload size={40} className="text-gray-400 mb-3" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF, WEBP (MAX. 5MB)
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>
        )}
        {errors.coverImage && (
          <p className="mt-1 text-sm text-red-500">{errors.coverImage}</p>
        )}
      </div>

      {/* Rich Text Editor */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Content <span className="text-red-500">*</span>
        </label>
        <RichTextEditor
          content={formData.content}
          onChange={handleContentChange}
          placeholder="Write your blog content here..."
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-500">{errors.content}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4 border-t">
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>

        <div className="flex space-x-3">
          {/* Save as Draft Button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSubmit("draft")}
            loading={loading}
            disabled={loading}
          >
            <Save size={18} className="mr-2" />
            Save as Draft
          </Button>

          {/* Publish Button */}
          <Button
            type="button"
            variant="primary"
            onClick={() => handleSubmit("published")}
            loading={loading}
            disabled={loading}
          >
            <Send size={18} className="mr-2" />
            {blogId && status === "published" ? "Update" : "Publish"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default BlogForm;