import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
        image_url: { type: String, default: "https://example.com/default-profile.png" }
, // 🟢 "image_url" ki spelling match karo
        enrolledCourses: [{
            type: String,
            ref: 'Course'
        }]
    },
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;
