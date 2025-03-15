import { Webhook } from "svix";
import User from "../models/user.js"; // Ensure the correct path

export const clerkWebHooks = async (req, res) => {
    try {
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        // Verify Webhook Signature
        await whook.verify(JSON.stringify(req.body), {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        });

        const { data, type } = req.body;

        switch (type) {
            case "user.created": {
                const userData = {
                    _id: data.id,
                    email: data.email_addresses?.[0]?.email_address || "",
                    name: `${data.first_name} ${data.last_name}`,
                    image_url: data.image_url,
                };

                console.log("User data to be inserted:", userData); // Debug log

                try {
                    const newUser = await User.create(userData);
                    console.log("✅ User successfully created:", newUser);
                    res.json({ success: true });
                } catch (err) {
                    console.error("❌ MongoDB insertion error:", err);
                    res.status(500).json({ success: false, message: err.message });
                }
                break;
            }

            case "user.updated": {
                const updatedUserData = {
                    email: data.email_addresses?.[0]?.email_address || "",
                    name: `${data.first_name} ${data.last_name}`,
                    image_url: data.image_url,
                };

                console.log("Updating user with ID:", data.id);

                try {
                    const updatedUser = await User.findByIdAndUpdate(data.id, updatedUserData, { new: true });
                    console.log("✅ User updated:", updatedUser);
                    res.json({ success: true });
                } catch (err) {
                    console.error("❌ MongoDB update error:", err);
                    res.status(500).json({ success: false, message: err.message });
                }
                break;
            }

            case "user.deleted": {
                console.log("Deleting user with ID:", data.id);

                try {
                    await User.findByIdAndDelete(data.id);
                    console.log("✅ User deleted");
                    res.json({ success: true });
                } catch (err) {
                    console.error("❌ MongoDB deletion error:", err);
                    res.status(500).json({ success: false, message: err.message });
                }
                break;
            }

            default:
                console.warn("⚠️ Unhandled event type:", type);
                res.json({ success: false, message: "Unhandled event type" });
                break;
        }
    } catch (error) {
        console.error("❌ Webhook verification failed:", error);
        res.status(400).json({ success: false, message: "Invalid webhook signature" });
    }
};
