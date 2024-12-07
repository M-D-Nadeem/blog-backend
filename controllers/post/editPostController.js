import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import dotenv from "dotenv";
import Post from "../../model/postModel.js";
import { s3Client } from "../../server.js";
import { generateSummary, generateTags } from "../../utils/llmHelper.js";

dotenv.config();

export const editPost = async (req, res) => {
  try {
    const { title, content } = req.body;    
    const { id: postId } = req.params;
    console.log("gvgh",postId);

    if ( !postId) {
      return res.status(400).json({
        success: false,
        message: "Post ID are required",
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }


    // Handle image uploads if provided
    let updatedImages = post.coverImage || [];
    if (req.files && req.files.length > 0) {
        updatedImages=[]
      try {
        const uploadPromises = req.files.map((file) => {
          const { buffer: fileBuffer, mimetype } = file;
          const generateFileName = (bytes = 32) =>
            crypto.randomBytes(bytes).toString("hex");
          const fileName = generateFileName();
          updatedImages.push(fileName);

          const uploadParams = {
            Bucket: process.env.BUCKET_NAME,
            Body: fileBuffer,
            Key: `blogs-post/${fileName}`,
            ContentType: mimetype,
          };
          return s3Client.send(new PutObjectCommand(uploadParams));
        });

        await Promise.all(uploadPromises);
      } catch (err) {
        console.error("S3 Upload Error:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to upload images",
          details: err,
        });
      }
    }

    // Update summary and tags if content is modified
    let updatedSummary = post.summary;
    let updatedTags = post.tags;

    if (content && content !== post.content) {
      updatedSummary = await generateSummary(content);
      updatedTags = await generateTags(content);
    }

    // Update post fields
    post.title = title || post.title;
    post.content = content || post.content;
    post.summary = updatedSummary;
    post.tags = updatedTags;
    post.coverImage = updatedImages;

    await post.save();

    res.status(200).json({ success: true, message: "Post updated successfully", post });
  } catch (error) {
    console.error("Error editing post:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to edit post",
      details: error,
    });
  }
};
