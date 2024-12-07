import mongoose from "mongoose";
import Report from "./postModel.js"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

const userSchema = new mongoose.Schema({
   name: {
    type: String,
    required: true
   },
   email: {
    type: String,
    required: true,
    unique: true
   },
   password: {
    type: String,
    required: function () {
        return !this.googleId; 
      },
    },
    googleId: {
        type: String,
        required: function () {
          return !this.password; 
        },
      },
},{
    timestamps: true
})

userSchema.methods={
  jwtToken(){
      return jwt.sign(
              {userid: this._id},
              process.env.JWT_SECRET_CODE,
              {expiresIn:'24h'} 
          )
  },
}



userSchema.post('Post',async function(res, next){
    await Report.deleteMany({user: this._id});
    next();
})

const userModel = mongoose.model("User",userSchema)
export default userModel