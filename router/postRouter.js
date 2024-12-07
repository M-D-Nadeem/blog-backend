import express from "express";
import { createPost } from "../controllers/post/addPostContoller.js";
import upload from "../middlewares/multer-middleware.js";
import { editPost } from "../controllers/post/editPostController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getAllPosts, getPostById } from "../controllers/post/getPostController.js";
import { deletePostById } from "../controllers/post/deletePostController.js";

const postRouter = express.Router();

postRouter.post("/create",authMiddleware, upload.array("coverImage", 1), createPost);
postRouter.put("/update/:id",authMiddleware, upload.array("coverImage", 1),editPost )
postRouter.get("/getAll",authMiddleware, getAllPosts);
postRouter.get("/getById/:id",authMiddleware, getPostById);
postRouter.delete("/delete/:id",authMiddleware, deletePostById);

export default postRouter;
