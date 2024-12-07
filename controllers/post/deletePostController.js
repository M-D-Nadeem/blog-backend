import { CreateInvalidationCommand } from "@aws-sdk/client-cloudfront";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Post from "../../model/postModel.js";
import { cloudFront, s3Client } from "../../server.js";

dotenv.config();

export const deletePostById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid post ID" });
  }

  try {
    const postToDelete = await Post.findById(id);

    if (!postToDelete) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    const deletePromises = postToDelete.coverImage.map(async (imageName) => {
      const deleteParams = {
        Bucket: process.env.BUCKET_NAME,
        Key: `blogs-post/${imageName}`,
      };
      await s3Client.send(new DeleteObjectCommand(deleteParams));
    });

    const invalidationPaths = postToDelete.coverImage.map(
      (imageName) => `/blogs-post/${imageName}`
    );

    const cfCommand = new CreateInvalidationCommand({
      DistributionId: process.env.CLOUD_FRONT_DIST_ID,
      InvalidationBatch: {
        CallerReference: Date.now().toString(),
        Paths: {
          Quantity: invalidationPaths.length,
          Items: invalidationPaths,
        },
      },
    });

    await Promise.all(deletePromises);
    await cloudFront.send(cfCommand);
    await Post.findByIdAndDelete(id);

    return res
      .status(200)
      .json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete post",
        details: error,
      });
  }
};
