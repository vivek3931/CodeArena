import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    name: {
        type: String,
        trim: true,
        default: "",
    },
    preference: {
        type: String,
        enum: ["user", "company", ""],
        default: "",
    },
    bio: {
        type: String,
        default: "",
    },
    location: {
        type: String,
        default: "",
    },
    github: {
        type: String,
        default: "",
    },
    role: {
        type: String,
        enum: ["member", "admin", "superadmin"],
        default: "member",
    },
    rating: {
        type: Number,
        default: 0
    },
    badges: [{
        id: { type: String, required: true },
        name: { type: String, required: true },
        icon: { type: String, required: true },
        img: { type: String },
        description: { type: String },
        earnedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
