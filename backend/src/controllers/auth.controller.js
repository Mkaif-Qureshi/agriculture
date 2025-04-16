import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  console.log('Signup called')
  const { username, email, phoneNo, password, role, gender } = req.body;

  // Basic validation
  if (!username || !phoneNo || !password || !role || !gender) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }
  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters long",
    });
  }

  try {
    //check if user already exisits

    const existingUser1 = await User.findOne({ email });
    if (existingUser1) {
      return res.status(409).json({
        success: false,
        message: "User already exists with the given email",
      });
    }
    const existingUser2 = await User.findOne({ phoneNo });
    if (existingUser2) {
      return res.status(409).json({
        success: false,
        message: "User already exists with the given phone number",
      });
    }

    //if reached here that means we can create a user
    //password

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      phoneNo,
      role,
      gender,
      password: hashedPassword,
    });

    if (newUser) {
      //generate jwt token
      generateToken(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        success: true,
        message: "Signup successful",
        user: {
          _id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          phoneNo: newUser.phoneNo,
          role: newUser.role,
          gender: newUser.gender,
          profilePic: newUser.profilePic,
          dob : newUser.dob,
          age : newUser.age,
          location : newUser.location,
          governmentId : newUser.governmentId,
          languageSpoken : newUser.languageSpoken,
          bio : newUser.bio,
          socialLinks : newUser.socialLinks,
          documents : newUser.documents,
          isVerified : newUser.isVerified,
        },
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid user data" });
    }
  } catch (err) {
    console.log("Error in signup", err);

    if (err.name === "ValidationError") {
      const error = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        error,
      });
    }
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const loginWithEmail = async (req, res) => {
  console.log('Login with email called')
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters long",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid credentials" });
    }

    generateToken(user._id, res);
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        phoneNo: user.phoneNo,
        role: user.role,
        gender: user.gender,
        profilePic: user.profilePic,
        dob : user.dob,
        age : user.age,
        location : user.location,
        governmentId : user.governmentId,
        languageSpoken : user.languageSpoken,
        bio : user.bio,
        socialLinks : user.socialLinks,
        documents : user.documents,
        isVerified : user.isVerified,
      },
    });
  } catch (err) {
    console.log("Error in loginWithEmail", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const loginWithPhone = async (req, res) => {
  console.log('Login with phone called')
  const { phoneNo, password } = req.body;

  if (!phoneNo || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters long",
    });
  }

  try {
    const user = await User.findOne({ phoneNo });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid credentials" });
    }

    generateToken(user._id, res);
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        phoneNo: user.phoneNo,
        role: user.role,
        gender: user.gender,
        profilePic: user.profilePic,
        dob : user.dob,
        age : user.age,
        location : user.location,
        governmentId : user.governmentId,
        languageSpoken : user.languageSpoken,
        bio : user.bio,
        socialLinks : user.socialLinks,
        documents : user.documents,
        isVerified : user.isVerified,
      },
    });
  } catch (err) {
    console.log("Error in loginWithPhone", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  console.log('Logout called')
  //clear cookies
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (err) {
    console.log("Error in logout", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getProfileCompletion = async (req,res) =>{
  try {
    const userId = req.user._id
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const fields = [
      user.email,
      user.phoneNo,
      user.username,
      user.gender,
      user.dob,
      user.age,
      user.profilePic,
      user.location?.address,
      user.location?.lat !== 0 ? user.location.lat : null,
      user.location?.lon !== 0 ? user.location.lon : null,
      user.location?.city,
      user.location?.state,
      user.location?.country,
      user.location?.pincode,
      user.governmentId?.idName,
      user.governmentId?.idValue,
      user.languageSpoken?.length > 0 ? 'filled' : null,
      user.bio,
      user.socialLinks?.facebook,
      user.socialLinks?.instagram,
      user.isVerified,
    ];

    const filled = fields.filter((f) => f !== undefined && f !== null && f !== '').length;
    const total = fields.length;
    const percentage = Math.round((filled / total) * 100);

    return res.json({
      percentage,
      filledFields: filled,
      totalFields: total,
      message: `Your profile is ${percentage}% complete`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}



export const updateProfile = async (req, res) => {
    try {
      const userId = req.user._id;
      const { username, phoneNo, dob, gender } = req.body;
  
      const updateFields = {};
  
      // Validate and trim username
      if (username) {
        const trimmedUsername = username.trim();
        if (trimmedUsername.length < 3) {
          return res.status(400).json({
            success: false,
            message: "Username cannot be less than 3 characters",
          });
        }
        updateFields.username = trimmedUsername;
      }
  
      // Validate and trim phone number
      if (phoneNo) {
        const trimmedPhone = phoneNo.trim();
        const phoneRegex = /^\+\d{1,3}\d{10}$/;
  
        if (!phoneRegex.test(trimmedPhone)) {
          return res.status(400).json({
            success: false,
            message: "Phone number must be in format +<countrycode><10digitnumber>",
          });
        }
  
        const existingUserWithPhone = await User.findOne({ phoneNo: trimmedPhone });
        if (existingUserWithPhone && existingUserWithPhone._id.toString() !== userId.toString()) {
          return res.status(409).json({
            success: false,
            message: "Phone number already exists",
          });
        }
  
        updateFields.phoneNo = trimmedPhone;
      }
  
      // Validate gender if provided
      if (gender) {
        const allowedGenders = ["Male", "Female", "Other"];
        if (!allowedGenders.includes(gender)) {
          return res.status(400).json({
            success: false,
            message: "Invalid gender provided. Allowed values: Male, Female, Other",
          });
        }
        updateFields.gender = gender;
      }
  
      // Add dob if provided
      if (dob) updateFields.dob = dob;
  
      const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
        new: true,
      }).select("-password");
  
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
  
      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (err) {
      console.error("Error in updateProfile:", err);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  };  

export const updateProfilePic = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res
        .status(400)
        .json({ success: false, message: "Profile pic is required" });
    }
    const uploadRes = await cloudinary.uploader.upload(profilePic);
    const updatedUser = User.findById(
      userId,
      { profilePic: uploadRes.url },
      { new: true }
    );

    res
      .status(200)
      .json({ success: true, message: "Updated user profile pic" });
  } catch (err) {
    console.log("Error", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
