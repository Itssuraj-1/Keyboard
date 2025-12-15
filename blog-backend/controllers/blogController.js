import Blog from "../models/Blog.js";
import Comment from "../models/Comment.js";
import ApiResponse from "../utils/apiResponse.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import fs from "fs";

// @desc    Get all blogs (with pagination and search)
// @route   GET /api/blogs
// @access  Public
export const getBlogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order === "asc" ? 1 : -1;

    // Build query
    const query = search ? { $text: { $search: search } } : {};

    // Get total count
    const total = await Blog.countDocuments(query);

    // Get blogs
    const blogs = await Blog.find(query)
      .populate("author", "name email avatar")
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limit)
      .lean();

    return ApiResponse.success(res, 200, "Blogs retrieved successfully", {
      blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single blog by ID
// @route   GET /api/blogs/:id
// @access  Public
export const getBlogById = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("author", "name email avatar bio")
      .populate({
        path: "comments",
        populate: { path: "author", select: "name avatar" },
      })
      .lean();

    if (!blog) {
      return ApiResponse.error(res, 404, "Blog not found");
    }

    return ApiResponse.success(res, 200, "Blog retrieved successfully", blog);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new blog
// @route   POST /api/blogs
// @access  Private
export const createBlog = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    // Validate required fields
    if (!title || !content) {
      return ApiResponse.error(res, 400, "Please provide title and content");
    }

    // Validate file upload
    if (!req.file) {
      return ApiResponse.error(res, 400, "Please upload a cover image");
    }

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.path, "blog-covers");

    // Delete local file after upload
    fs.unlinkSync(req.file.path);

    // Create blog
    const blog = await Blog.create({
      title,
      content,
      coverImage: uploadResult.url,
      author: req.user._id,
    });

    // Populate author details
    await blog.populate("author", "name email avatar");

    return ApiResponse.success(res, 201, "Blog created successfully", blog);
  } catch (error) {
    // Clean up local file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private
export const updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return ApiResponse.error(res, 404, "Blog not found");
    }

    // Check if user is the author
    if (blog.author.toString() !== req.user._id.toString()) {
      return ApiResponse.error(res, 403, "Not authorized to update this blog");
    }

    const { title, content } = req.body;
    let coverImageUrl = blog.coverImage;

    // If new image uploaded, upload to Cloudinary
    if (req.file) {
      // Extract public_id from old image URL and delete
      const oldPublicId = blog.coverImage
        .split("/")
        .slice(-2)
        .join("/")
        .split(".")[0];
      await deleteFromCloudinary(oldPublicId);

      // Upload new image
      const uploadResult = await uploadToCloudinary(
        req.file.path,
        "blog-covers"
      );
      coverImageUrl = uploadResult.url;

      // Delete local file
      fs.unlinkSync(req.file.path);
    }

    // Update blog
    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.coverImage = coverImageUrl;

    const updatedBlog = await blog.save();
    await updatedBlog.populate("author", "name email avatar");

    return ApiResponse.success(
      res,
      200,
      "Blog updated successfully",
      updatedBlog
    );
  } catch (error) {
    // Clean up local file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private
export const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return ApiResponse.error(res, 404, "Blog not found");
    }

    // Check if user is the author
    if (blog.author.toString() !== req.user._id.toString()) {
      return ApiResponse.error(res, 403, "Not authorized to delete this blog");
    }

    // Delete cover image from Cloudinary
    const publicId = blog.coverImage
      .split("/")
      .slice(-2)
      .join("/")
      .split(".")[0];
    await deleteFromCloudinary(publicId);

    // Delete all comments associated with blog
    await Comment.deleteMany({ blog: blog._id });

    // Delete blog
    await blog.deleteOne();

    return ApiResponse.success(res, 200, "Blog deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

// @desc    Get blogs by specific user
// @route   GET /api/blogs/user/:userId
// @access  Public
export const getBlogsByUser = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Blog.countDocuments({ author: req.params.userId });

    const blogs = await Blog.find({ author: req.params.userId })
      .populate("author", "name email avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return ApiResponse.success(res, 200, "User blogs retrieved successfully", {
      blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};


// Add new function to get user's own blogs
export const getMyBlogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status; // 'draft' or 'published'

    const query = { author: req.user._id };
    if (status) {
      query.status = status;
    }

    const total = await Blog.countDocuments(query);

    const blogs = await Blog.find(query)
      .populate("author", "name email avatar")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return ApiResponse.success(res, 200, "My blogs retrieved successfully", {
      blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};
