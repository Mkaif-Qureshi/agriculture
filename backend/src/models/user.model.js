import mongoose from "mongoose";

const calculateAge = (dob) => {
  const diff = Date.now() - dob.getTime();
  const ageDt = new Date(diff);
  return Math.abs(ageDt.getUTCFullYear() - 1970);
};

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, "Please enter a valid email address"],
    },
    phoneNo: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      match: [
        /^\+\d{1,3}[1-9]\d{9}$/,
        "Phone number must be in format +<countrycode><10digitnumber>",
      ],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
    },
    role: {
      type: String,
      enum: ["Farmer", "Logistics"],
      required: [true, "Role is required"],
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: [true, "Gender is required"],
    },
    dob: {
      type: Date,
    },
    age: {
      type: Number,
    },
    profilePic: {
      type: String,
      default: "",
    },
    location: {
      address: {
        type: String,
        default: "",
      },
      lat: {
        type: Number,
        default: 0,
      },
      lon: {
        type: Number,
        default: 0,
      },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      country: { type: String, default: "" },
      pincode: { type: String, default: "" },
    },
    governmentId: {
      idName: {
        type: String,
        default: "",
      },
      idValue: {
        type: String,
        default: "",
      },
    },
    languageSpoken: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      default: "",
    },
    socialLinks: {
      facebook: {
        type: String,
        default: "",
      },
      instagram: {
        type: String,
        default: "",
      },
    },
    documents: {
      type: [String],
      default: [],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", function (next) {
  if (this.dob) {
    this.age = calculateAge(this.dob);
  }
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
