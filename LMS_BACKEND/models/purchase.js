import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema({
    courseId: {
        type: String,
        ref: 'Course',
        required: true
    },
    userId: { type: String, required: true }, // Store as a string, not ObjectId
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    }
}, { timestamps: true });

const Purchase = mongoose.model("Purchase", purchaseSchema);
export default Purchase;
