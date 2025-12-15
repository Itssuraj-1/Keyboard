// frontend/src/pages/MyBlogs.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { blogsAPI } from "../api/blogs";
import DashboardLayout from "../components/layout/DashboardLayout";
import { Heart, MessageCircle, Edit, Trash2, Eye } from "lucide-react";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Modal from "../components/common/Modal";
import { formatDate } from "../utils/formatDate";

const MyBlogs = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("published");
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({ published: 0, draft: 0 });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchMyBlogs();
    fetchCounts();
  }, [activeTab]);

  const fetchMyBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogsAPI.getMyBlogs({ status: activeTab });
      setBlogs(response.data.blogs);
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCounts = async () => {
    try {
      const [publishedRes, draftRes] = await Promise.all([
        blogsAPI.getMyBlogs({ status: "published", limit: 1 }),
        blogsAPI.getMyBlogs({ status: "draft", limit: 1 }),
      ]);
      setCounts({
        published: publishedRes.data.pagination.total,
        draft: draftRes.data.pagination.total,
      });
    } catch (err) {
      console.error("Failed to fetch counts:", err);
    }
  };

  const handleEdit = (blogId) => {
    navigate(`/edit/${blogId}`);
  };

  const handleView = (blogId) => {
    navigate(`/blog/${blogId}`);
  };

  const handleDeleteClick = (blog) => {
    setBlogToDelete(blog);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await blogsAPI.deleteBlog(blogToDelete._id);
      setBlogs(blogs.filter((b) => b._id !== blogToDelete._id));
      fetchCounts(); // Update counts
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete blog");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setBlogToDelete(null);
    }
  };

  const truncateContent = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Blogs</h1>
          <p className="text-gray-600">
            Manage your published posts and drafts
          </p>
        </div>

        {/* Tabs */}
        <Card className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("published")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "published"
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Published ({counts.published})
              </button>
              <button
                onClick={() => setActiveTab("draft")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "draft"
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Drafts ({counts.draft})
              </button>
            </nav>
          </div>

          {/* Blog List */}
          <div className="p-6">
            {loading ? (
              <LoadingSpinner size="md" />
            ) : blogs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">
                  {activeTab === "published"
                    ? "You haven't published any blogs yet"
                    : "You don't have any drafts"}
                </p>
                <Button variant="primary" onClick={() => navigate("/create")}>
                  Write Your First Blog
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {blogs.map((blog) => (
                  <div
                    key={blog._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-4">
                      {/* Cover Image */}
                      <div className="w-32 h-24 shrink-0 overflow-hidden rounded-md">
                        <img
                          src={blog.coverImage}
                          alt={blog.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                          {blog.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {truncateContent(blog.content)}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{formatDate(blog.updatedAt)}</span>
                          {activeTab === "published" && (
                            <>
                              <div className="flex items-center space-x-1">
                                <Heart size={14} />
                                <span>{blog.likesCount}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MessageCircle size={14} />
                                <span>{blog.commentsCount}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        {activeTab === "published" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(blog._id)}
                          >
                            <Eye size={16} className="mr-1" />
                            View
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(blog._id)}
                        >
                          <Edit size={16} className="mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteClick(blog)}
                        >
                          <Trash2 size={16} className="mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Blog"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete "{blogToDelete?.title}"? This action
            cannot be undone.
          </p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              loading={deleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default MyBlogs;
