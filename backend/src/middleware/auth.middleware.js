import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req,res , next) => { //next function
    try {
        const token  = req.cookies.jwt

        if(!token){
            return res.status(401).json({success : false , message : "Unauthorized - No Token Provided"})
        }

        //token present now validate it
        const decoded = jwt.verify(token , process.env.JWT_SECRET)

        if(!decoded){
            return res.status(401).json({success : false , message : "Unauthorized - Token is Invalid"})
        }

        const user = await User.findById(decoded.userId).select("-password");

        if(!user){
            return res.status(404).json({success : false , message : "User not found"})
        }

        //now user 
        req.user = user; //sent in the request
        next()


    } catch (err) {
        console.log("Error in protect route" , err);
        return res.status(500).json({success : false , message : "Internal Server Error"})
    }
} 
