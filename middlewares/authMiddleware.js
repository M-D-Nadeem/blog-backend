import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

const authMiddleware = function(req,res,next) {
    try{      
      const token=(req.cookies.token)
      console.log(req);
      
       const decoded = jwt.verify(token, process.env.JWT_SECRET_CODE);
       console.log(decoded);
       
       req.body.userid=decoded.userid;
       next();
    }
    catch(error){ 
      console.log(error);
           
      res.send({
        message: error.message,
        data: error,
        success: false
      })
    }
}

export default authMiddleware