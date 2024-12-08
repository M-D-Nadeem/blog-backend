import Post from "../../model/postModel.js";
import mongoose from "mongoose";

export const getAllPosts = async (req, res) => {
    
  try {    
    const posts = await Post.find().populate('user')     

    if (!posts || posts.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No post found" });
    }

    const postWithCloudFrontUrls = posts.map((post) => {
      const imagesWithUrls = post.coverImage.map((imageName) => {
        const cloudFrontUrl = `https://diocrzni6xksb.cloudfront.net/blogs-post/${imageName}`;
        return cloudFrontUrl;
      });

      return {
        ...post.toObject(),
        coverImage: imagesWithUrls,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Posts fetched successfully",
      posts: postWithCloudFrontUrls,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve post",
      details: error,
    });
  }
};



export const getPostById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid post ID" });
  }

  try {
    const post = await Post.findById(id).populate('user');

    if (!post) {
      return res.status(404).json({ success: false, message: "post not found" });
    }

    const imagesWithUrls = post.coverImage.map((imageName) => {
      return `https://diocrzni6xksb.cloudfront.net/blogs-post/${imageName}`;
    });

    return res.status(200).json({
      success: true,
      message: "Post fetched successfully",
      post: {
        ...post.toObject(),
        coverImage: imagesWithUrls,
      },
    });
  } catch (error) {
    console.error("Error fetching post by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve post",
      details: error,
    });
  }
};
