import { Webhook } from "svix";
import User from "../models/user.js"; // Ensure correct model path

export const clerkWebHooks = async (req, res) => {
    try {
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        try {
            whook.verify(JSON.stringify(req.body), {
                "svix-id": req.headers["svix-id"],
                "svix-timestamp": req.headers["svix-timestamp"],
                "svix-signature": req.headers["svix-signature"]
            });
        } catch (error) {
            console.error("❌ Webhook verification failed:", error);
            return res.status(400).json({ success: false, message: "Invalid webhook signature" });
        }

        const { data, type } = req.body;
        console.log(`🔄 Webhook Received: ${type}`);

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
                return res.status(201).json({ success: true, message: "User added" });
            }

            case "user.updated": {
                const userData = {
                    email: data.email_addresses?.[0]?.email_address,
                    name: `${data.first_name} ${data.last_name}`,
                    image_url: data.image_url,
                };

                console.log("📌 Updating User:", userData);
                await User.findByIdAndUpdate(data.id, userData, { new: true });
                console.log("✅ User Updated Successfully");
                return res.status(200).json({ success: true, message: "User updated" });
            }

            case "user.deleted": {
                console.log("🗑 Deleting User ID:", data.id);
                await User.findByIdAndDelete(data.id);
                console.log("✅ User Deleted Successfully");
                return res.status(200).json({ success: true, message: "User deleted" });
            }

            default:
                console.warn("⚠️ Unhandled Webhook Type:", type);
                return res.status(400).json({ success: false, message: "Unhandled event type" });
        }
    } catch (error) {
        console.error("❌ Webhook Processing Error:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

