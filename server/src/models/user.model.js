import mongoose, { Schema } from "mongoose"
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        unique: true,
        sparse: true,   // allows multiple null values for unique field
        lowercase: true,
        trim: true,
    },
    avatar: {
        type: String
    },

    password: {
        type: String,
        required: [true, "Password is requires"]
    },
    refreshToken: {
        type: String,
    }
},
    { timestamps: true }

)

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// ✅ Password Compare Method

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

// ✅ Access Token Method

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

// ✅ Refresh Token

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User", userSchema);