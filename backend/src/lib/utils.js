import jwt from "jsonwebtoken";

export const generateToken = (userId , res) => {
    const token = jwt.sign({userId} , process.env.JWT_SECRET , {expiresIn : "7d"})

    //send jwt in cookies
    res.cookie("jwt" , token , {
        maxAge : 7*24*60*60*1000, //in ms
        httpOnly : true, //prevent XSS attacks cross-site scripting attacks
        sameSite : "strict", //CRSF attacks
        secure : process.env.NODE_ENV != "developement" //https or http
    })

    return token
}