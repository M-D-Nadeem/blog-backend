import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import connection from "./config/dbConnection.js"
import userRouter from "./router/userRouter.js"
import { S3Client } from "@aws-sdk/client-s3";
import { CloudFrontClient } from "@aws-sdk/client-cloudfront";
import postRouter from "./router/postRouter.js"
import cookieParser from "cookie-parser"

dotenv.config()
connection()
const app=express()

const region = process.env.BUCKET_REGION
const accessKeyId = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_ACCESS_KEY

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey
  }
})

const cloudFront=new CloudFrontClient({
  region,
  credentials:{
    accessKeyId,
    secretAccessKey
  }
})

app.use("/ping",(req,res)=>{
    res.send("PONG2!")
})
app.use(express.json())
app.use(cors({
  origin:["http://localhost:5173","https://blog-frontend-bay-ten.vercel.app"],
  credentials:true
}))
app.use(cookieParser())
app.use(express.urlencoded({extended:true}))


app.use("/user",userRouter)
app.use("/post",postRouter)

const PORT=process.env.PORT || 3001
app.listen(3000,()=>{
    console.log(`Server is running on http:\\localhost:${process.env.PORT}`);
})

export {s3Client,cloudFront}