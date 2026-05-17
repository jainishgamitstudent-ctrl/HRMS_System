const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: [true, "Email already exists"],
            lowercase: true,
            trim: true,
            match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Please use a valid email address"]
        },
        password: {
            type: String,
            required: [true, "Password is required"]
        },
        role: {
            type: String,
            enum: ["employee","hr", "admin", "superadmin"],
            default: "employee"
        },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company"
        },
        permissions: [{
            type: String
        }],
        refreshToken: {
            type: String
        },
        isEmailVerified: {
            type: Boolean,
            default: false
        },
        verificationToken: String,
        resetPasswordToken: String,
        resetPasswordExpires: Date,
        twoFactorOTP: String,
        twoFactorOTPExpires: Date,
        firstLogin2FAVerified: {
            type: Boolean,
            default: false
        },
        dob: {
            type: Date
        },
        joiningDate: {
            type: Date,
            default: Date.now
        },
        phone: {
            type: String
        },
        address: {
            type: String
        },
        profileImage: {
            type: String
        },
        employeeId: {
            type: String,
            unique: true,
            sparse: true
        },
        department: {
            type: String
        },
        designation: {
            type: String
        },
        reportingManager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        annualSalary: {
            type: Number
        },
        employmentType: {
            type: String,
            enum: ["full-time", "part-time", "contract", "internship", "remote"],
            default: "full-time"
        },
        status: {
            type: String,
            enum: ["New Hire", "Onboarding", "Active", "On Leave", "Resigned", "Terminated", "Terminate"],
            default: "Active"
        },
        currentBaseSalary: {
            type: Number
        },
        complianceStatus: {
            type: String,
            enum: ["Compliant", "Verified", "Under Review", "Action Required"],
            default: "Compliant"
        },
        securitySettings: {
            twoFactorEnabled: {
                type: Boolean,
                default: false
            },
            loginAlerts: {
                type: Boolean,
                default: true
            },
            recoveryEmail: {
                type: String,
                trim: true,
                lowercase: true
            },
            sessionTimeoutMinutes: {
                type: Number,
                default: 30,
                min: 5,
                max: 1440
            },
            passwordUpdatedAt: {
                type: Date
            }
        },
        notificationPreferences: {
            emailNotifications: {
                type: Boolean,
                default: true
            },
            hrAnnouncements: {
                type: Boolean,
                default: true
            },
            adminAnnouncements: {
                type: Boolean,
                default: true
            },
            policyUpdates: {
                type: Boolean,
                default: true
            },
            alerts: {
                type: Boolean,
                default: true
            }
        },
        doubleShiftAllowed: {
            type: Boolean,
            default: false
        },
        expoPushTokens: [{
            type: String,
            trim: true
        }]
    },
    { timestamps: true }
);

userSchema.index({ role: 1, status: 1 });
userSchema.index({ department: 1 });
userSchema.index({ dob: 1 });
userSchema.index({ employeeId: 1 });

// Hash password before saving
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Generate Access Token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        { _id: this._id, email: this.email, role: this.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};

// Generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { _id: this._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};

const User = mongoose.model("User", userSchema);
module.exports = User;
