import { Webhook } from "svix";
import User from "../models/User.js"; // Ensure this points to your User model

export const clerkWebHooks = async (req, res) => {
    try {
        // Validate Webhook Signature
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
        const payload = whook.verify(JSON.stringify(req.body), {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        });

        console.log("🔄 Webhook Triggered:", payload);

        const { data, type } = req.body;

        switch (type) {
            case "user.created": {
                const userData = {
                    _id: data.id,
                    email: data.email_addresses?.[0]?.email_address || "no-email",
                    name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
                    image_url: data.image_url || "",
                };

                console.log("📌 Creating User:", userData);
                await User.create(userData);
                console.log("✅ User Created Successfully");
                res.status(201).json({ success: true, message: "User added" });
                break;
            }

            case "user.updated": {
                const userData = {
                    email: data.email_addresses?.[0]?.email_address,
                    name: `${data.first_name} ${data.last_name}`,
                    image_url: data.image_url,
                };

                console.log("📌 Updating User:", userData);
                await User.findByIdAndUpdate(data.id, userData);
                console.log("✅ User Updated Successfully");
                res.status(200).json({ success: true, message: "User updated" });
                break;
            }

            case "user.deleted": {
                console.log("🗑 Deleting User ID:", data.id);
                await User.findByIdAndDelete(data.id);
                console.log("✅ User Deleted Successfully");
                res.status(200).json({ success: true, message: "User deleted" });
                break;
            }

            default:
                console.log("⚠️ Unhandled Webhook Type:", type);
                res.status(400).json({ success: false, message: "Unhandled event type" });
                break;
        }
    } catch (error) {
        console.error("❌ Webhook Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};
