import User from "../model/userModel.js"
import { oauth2client } from "../utils/googleConfig.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";
import axios from "axios"

const cookieOption={
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
    secure: process.env.NODE_ENV === 'production',  // Set to true in production (HTTPS)
    sameSite: 'None',
    maxAge: 24 * 60 * 60 * 1000, // Cookie expiration time (1 day)
}
const register = async(req,res) => {
    try{
     console.log(req.body.email);
      // check if user already exists
      const userExists = await User.findOne({email: req.body.email})
      
      if(userExists){
         return res.status(200).send({
             message: "User already exists.",
             success: false
         })
      }
      else{
         const salt = await bcrypt.genSalt(10)
         const hashedPassword = await bcrypt.hash(req.body.password,salt)
         const newUser = new User({
             name: req.body.name,
             email: req.body.email,
             password: hashedPassword
         })
         newUser=await newUser.save()
         

//Creating token
     const token=await newUser.jwtToken()

        res.cookie("token",token,cookieOption)

         res.status(200).send({
             message: "User registered successfully.",
             success: true,
             data:{token,userId:newUser._id}
         })
      }
    }
    catch(error){
       res.status(400).send({
         message: error.message,
         data: error,
         success: false
       })
    }
 }

 const login = async(req,res) => {
    try{     
     const user = await User.findOne({email: req.body.email})
     if(!user){
        return res.status(200).json({
            message: "User does not exist.",
            success: false
          });
     }
     if (user.googleId && !user.password) {
         return res.status(200).json({
           message: "This email is registered via Google. Please log in using Google.",
           success: false
         });
       }       
      if(user){
         const passwordsMatched = await bcrypt.compare(req.body.password,user.password)
         //check if passwords are valid
         if(passwordsMatched){
            const token=await user.jwtToken()
            console.log("t1=",token);
            
             res.cookie("token",token,cookieOption)
            
             res.send({
               message: "User logged in successfully",
               data: {token,userId:user._id},
               success: true,
             })
         }
         else{
             res.status(200).send({
                 message: "Invalid Password",
                 success: false
             })
         }
      }
      else{
         res.status(200).send({
             message: "User doesnot exist.",
             success: false
         })
      }     
    }
    catch(error){
     res.status(400).send({
         message: error.message,
         data: error,
         success: false
     })
    }
 }

 const loginWithGoogle=async(req,res)=>{
    try{
       const {code}=req.query
       

       
       const googleRes=await oauth2client.getToken(code)
    //    console.log(googleRes);

       
       oauth2client.setCredentials(googleRes.tokens)

       const userRes=await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
       )       
      
       const { email, id, name }=userRes.data
       const googleId=id
       
       let user = await User.findOne({email})
       if(!user){
        try{
        user=await User.create({email,googleId,name})
        }
        catch(err){
            console.log(err);  
        }
       }
       
       const token=await user.jwtToken()

    res.cookie("token",token,cookieOption)

    res.send({
      message: "User logged in successfully",
      data: {token,userId:user._id},
      success: true,
    })
       
    }
    catch(error){
        res.status(400).send({
            message: error.message,
            data: error,
            success: false
        })

    }
}

const logOut=async (req,res,next)=>{
    try{
    res.cookie("token","null",{
        secure:true,
        maxAge:0,
        httpOnly:true
    })
    return res.status(200).json({
        success:true,
        message:"Log out sucessful"
    })
}
catch(err){
    console.log("ERROR in log out");
    return next(new AppError(err.message,500))
}
}
 
const getUserInfo = async(req,res) => {
    try{
       const user = await User.findOne({_id: req.body.userid})
       if(user){
         res.status(200).send({
             message: "User Info fetched successfully",
             data: user,
             success: true
         })
       }
       else{
         res.status(200).send({
             message: "Failed to fetch user info",
             data: null,
             success: false
         })
       }
    }
    catch(error){
     res.status(400).send({
         message: error.message,
         data: error,
         success: false
     })
    }
 }
 
export {register,login,loginWithGoogle,getUserInfo,logOut}