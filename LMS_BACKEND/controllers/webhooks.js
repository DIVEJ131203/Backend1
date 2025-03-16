import User from "../models/user.js"; // Ensure correct model path

export const clerkWebHooks = async (req, res) => {
    try {
        // Bypass verification for manual testing in Postman
        if (req.headers["svix-id"] === "test-id") {
            console.log("🛠 Bypassing webhook verification for test request.");
        } else {
            console.error("❌ Invalid webhook signature (Real Request)");
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
            case 'user.updated':{
                const userData={
                    email:data.email_addresses[0].email_address,
                    name:data.first_name +"" + data.last_name,
                    image_url:data.image_url,

                }
                await User.findByIdAndUpdate(data.id,userData)
                res.json({})
                break;
            
            }

            case 'user.deleted':{
                await User.findByIdAndDelete(data.id)
                res.json({})
                break;
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
