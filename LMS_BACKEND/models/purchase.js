import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Store as a string, not ObjectId
    courseId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Course" },
    amount: Number
}, {timestamps: true });

const Purchase = mongoose.model("Purchase", purchaseSchema);
export default Purchase;
