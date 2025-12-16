// frontend/src/components/blog/BlogForm.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { blogsAPI } from "../../api/blogs";
import Input from "../common/Input";
import Button from "../common/Button";
import RichTextEditor from "../common/RichTextEditor";
import { Upload, X, Save, ArrowRight, ArrowLeft } from "lucide-react";

/**
 * Multi-step blog form: Write first, then add title & cover
 */
const BlogForm = ({ blogId = null, initialData = null }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Write, 2: Details
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
      // When editing, start at step 1 (editor) so user can edit content
      setStep(1);
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

  const validateStep1 = () => {
    const newErrors = {};
    const textContent = formData.content.replace(/<[^>]*>/g, "").trim();

    if (!textContent || textContent.length < 20) {
      newErrors.content = "Content must be at least 20 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (isDraft = false) => {
    const newErrors = {};

    if (!formData.title || formData.title.trim().length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    } else if (formData.title.trim().length > 200) {
      newErrors.title = "Title cannot exceed 200 characters";
    }

    if (!isDraft && !blogId && !coverImage) {
      newErrors.coverImage = "Please upload a cover image";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSaveDraft = async () => {
    // Allow saving draft from step 1 with minimal validation
    const textContent = formData.content.replace(/<[^>]*>/g, "").trim();
    if (!textContent || textContent.length < 20) {
      setErrors({
        content: "Please write at least 20 characters before saving",
      });
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title.trim() || "Untitled Draft");
      formDataToSend.append("content", formData.content);
      formDataToSend.append("status", "draft");

      // For drafts, we need a placeholder image if none exists
      if (coverImage) {
        formDataToSend.append("coverImage", coverImage);
      } else if (!blogId) {
        // Create a temporary placeholder image for new drafts
        // We'll use a data URL as a workaround
        const canvas = document.createElement("canvas");
        canvas.width = 1200;
        canvas.height = 630;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#f3f4f6";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#9ca3af";
        ctx.font = "48px Inter";
        ctx.textAlign = "center";
        ctx.fillText(
          "Draft - Add Cover Later",
          canvas.width / 2,
          canvas.height / 2
        );

        // Convert canvas to blob
        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/jpeg")
        );
        formDataToSend.append("coverImage", blob, "draft-placeholder.jpg");
      }

      if (blogId) {
        await blogsAPI.updateBlog(blogId, formDataToSend);
      } else {
        await blogsAPI.createBlog(formDataToSend);
      }

      navigate("/my-blogs");
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to save draft");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!validateStep2(false)) return;

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title.trim());
      formDataToSend.append("content", formData.content);
      formDataToSend.append("status", "published");

      if (coverImage) {
        formDataToSend.append("coverImage", coverImage);
      }

      let response;
      if (blogId) {
        response = await blogsAPI.updateBlog(blogId, formDataToSend);
      } else {
        response = await blogsAPI.createBlog(formDataToSend);
      }

      navigate(`/blog/${response.data._id}`);
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to publish blog");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          <div
            className={`flex items-center ${
              step === 1 ? "text-black" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step === 1 ? "bg-black text-white" : "bg-gray-200"
              }`}
            >
              1
            </div>
            <span className="ml-2 font-medium">Write</span>
          </div>
          <div className="w-16 h-0.5 bg-gray-300"></div>
          <div
            className={`flex items-center ${
              step === 2 ? "text-black" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step === 2 ? "bg-black text-white" : "bg-gray-200"
              }`}
            >
              2
            </div>
            <span className="ml-2 font-medium">Details</span>
          </div>
        </div>
      </div>

      {apiError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
          {apiError}
        </div>
      )}

      {/* STEP 1: Write Content - Full Screen Experience */}
      {step === 1 && (
        <div className="fixed inset-0 top-16 left-64 bg-white z-10 flex flex-col">
          {/* Minimal Header */}
          <div className="shrink-0 border-b border-gray-100 px-12 py-4">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Start Writing
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Focus on your content. Add title and cover image next.
                </p>
              </div>

              {/* Compact Action Buttons with Better Styling */}
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate(-1)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </Button>

                <div className="h-6 w-px bg-gray-300"></div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveDraft}
                  loading={loading}
                  disabled={loading}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Save size={16} className="mr-2" />
                  Save Draft
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  onClick={handleNext}
                  className="bg-black hover:bg-gray-800 shadow-sm"
                >
                  Next
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </div>
          </div>

          {/* Full-Height Editor */}
          <div className="flex-1 overflow-y-auto px-12 py-8">
            <div className="max-w-5xl mx-auto">
              <RichTextEditor
                content={formData.content}
                onChange={handleContentChange}
                placeholder="Tell your story..."
              />
              {errors.content && (
                <p className="mt-2 text-sm text-red-500">{errors.content}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Add Details */}
      {step === 2 && (
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Finishing Touches
            </h2>
            <p className="text-gray-600">
              Add a compelling title and cover image for your blog
            </p>
          </div>

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
            placeholder="Enter an engaging title..."
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
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
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

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft size={18} className="mr-2" />
              Back to Writing
            </Button>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                loading={loading}
                disabled={loading}
              >
                <Save size={18} className="mr-2" />
                Save as Draft
              </Button>

              <Button
                type="button"
                variant="primary"
                onClick={handlePublish}
                loading={loading}
                disabled={loading}
              >
                {blogId && status === "published" ? "Update" : "Publish"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogForm;
