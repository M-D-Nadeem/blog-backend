import { PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import dotenv from "dotenv";
import Post from "../../model/postModel.js";
import { s3Client } from "../../server.js";
import { generateSummary, generateTags } from "../../utils/llmHelper.js";

dotenv.config();

export const createPost = async (req, res) => {
  try {
    const { userId, title, content } = req.body;
    console.log(userId);
    
    if (!userId || !title || !content) {
      return res
        .status(400)
        .json({ success: false, message: "Name and designation are required" });
    }

    let images = [];
    if (req.files) {
      try {
        const uploadPromises = req.files.map((file) => {
          const { buffer: fileBuffer, mimetype } = file;
          const generateFileName = (bytes = 32) =>
            crypto.randomBytes(bytes).toString("hex");
          const fileName = generateFileName();
          images.push(fileName);

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
    const summary = await generateSummary(content);
    const tags = await generateTags(content);
    console.log(tags);

    const post = new Post({
      user: userId,
      title,
      content,
      summary,
      tags,
      coverImage: images,
    });

    await post.save();

    if (!post) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to create post" });
    }

    res.status(201).json({success:true, message: "Post created successfully", post });
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create post",
      details: error,
    });
  }
};
