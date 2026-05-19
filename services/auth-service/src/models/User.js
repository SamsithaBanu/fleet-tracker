import mongoose from "mongoose";
import bycrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, 'Password must be atleast 6 characters.'],
            select: false,
        },
        role: {
            type: String,
            enum: ["admin", "driver", "customer"],
            default: 'customer',
        },
        phone: {
            type: String,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true
        },
        fcmToken: {
            type: String,
            default: null,
        },
        refreshToken: {
            type: String,
            select: false,
        }
    },
    {
        timestamps: true
    }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bycrypt.hash(this.password, 12);
    next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
    return bycrypt.compare(enteredPassword, this.password);
}

const User = mongoose.model('User', userSchema);
export default User;