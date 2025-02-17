import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
            select: false, // Prevent password from being retrieved by default
        },
        dob: { type: Date },
        gender: { type: String, enum: ["Male", "Female", "Other"] },
        role: {
            type: String,
            enum: ["Patient", "Doctor", "Admin"],
            default: "Patient",
        },
        phone: {
            type: String,
            unique: true,
            sparse: true,
        },
        profilePic: {
            type: String, // URL to profile image
            default: "default_avatar.png",
        },
        preferences: {
            theme: { type: String, enum: ["Light", "Dark"], default: "Light" },
            language: { type: String, default: "English" },
            accessibility: { type: Boolean, default: false },
        },
        medicalHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "MedicalHistory",
            },
        ],
        lastLogin: { type: Date, default: Date.now },

        // 🔐 Security Enhancements
        isVerified: { type: Boolean, default: false },
        twoFactorEnabled: { type: Boolean, default: false },
        twoFactorCode: { type: String, select: false },
        resetPasswordToken: { type: String, select: false },
        resetPasswordExpires: { type: Date, select: false },
    },
    { timestamps: true }
);

// 🔐 **Pre-Save Hook - Hash Password Before Storing**
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// 🔑 **Compare Password for Login**
userSchema.methods.verifyPassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

// 🔄 **Generate Password Reset Token**
userSchema.methods.generatePasswordReset = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // Token valid for 15 min
    return resetToken;
};

// 🔑 **Enable 2FA - Generate Code**
userSchema.methods.generateTwoFactorCode = function () {
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    this.twoFactorCode = bcrypt.hashSync(code, 10);
    return code;
};

// 🛠️ **MongoDB Indexing for Query Speed**
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 }, { unique: true, sparse: true });

// 🔒 **Hide Sensitive Fields in API Responses**
userSchema.set("toJSON", {
    transform: function (doc, ret) {
        delete ret.password;
        delete ret.twoFactorCode;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        return ret;
    },
});

const User = mongoose.model("User", userSchema);
export default User;