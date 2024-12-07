import express from "express"
import { getUserInfo, login, loginWithGoogle, logOut, register } from "../controllers/userController.js"
import authMiddleware from "../middlewares/authMiddleware.js"

const userRouter=express.Router()
userRouter.post("/register",register)
userRouter.post("/login",login)
userRouter.post("/loginWithGoogle",loginWithGoogle)
userRouter.get("/logout",authMiddleware,logOut)
userRouter.get('/get-user-info',authMiddleware,getUserInfo)
export default userRouter 