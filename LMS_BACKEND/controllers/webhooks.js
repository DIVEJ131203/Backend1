import { response } from "express";
import Stripe from "stripe";
import { Webhook } from "svix";
import Course from "../models/course.js";
import Purchase from "../models/purchase.js";
import User from "../models/user.js"; // Ensure correct model path

export const clerkWebHooks = async (req, res) => {
    try{
    const whook =new Webhook(process.env.CLERK_WEBHOOK_SECRET)
    await whook.verify(JSON.stringify(req.body),{
        "svix-id":req.headers["svix-id"],
        "svix-timestamp":req.headers["svix-timestamp"],
        "svix-signature":req.headers["svix-signature"]
    })

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
const stripeInstance=new Stripe(process.env.STRIPE_SECRET_KEY)
export const stripeWebhooks=async(req,res)=>{
    const sig= request.headers['stripe-signature'];
    let event;
    try{
        event=Stripe.webhooks.constructEvent(request.body,sig,process.env.STRIPE_WEBHOOK_SECRET);
    }
    catch(error){
        response.status(400).send('webhook error:${err.message}');
    }

    switch(event.type){
        case 'payment_intent.succeeded':
            const payment_intent=event.data.object;
            const paymentIntentId=payment_intent.id;
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent:paymentIntentId
            })
            const {purchaseId}=session.data[0].metadata;
            const purchaseData= await Purchase.findById(purchaseId);
            const userData=await User.findById(purchaseData.userId);
            const courseData=await Course.findById(purchaseData.courseId.toString());
            courseData.enrolledStudents.push(userData)
            await courseData.save()
            userData.enrolledCourses.push(courseData._id)
            await userData.save()
            purchaseData.status='completed'
            await purchaseData.save()
            break;
        case  'payment_intent.payment_failed':
            {
                const payment_intent=event.data.object;
                const paymentIntentId=payment_intent.id;
                const session = await stripeInstance.checkout.sessions.list({
                payment_intent:paymentIntentId
            })
            const {purchaseId}=session.data[0].metadata;
            const purchaseData=await Purchase.findById(purchaseId)
            purchaseData.status='failed'
            await purchaseData.save();
            }
        default:
            console.log(`unhandled event type ${event.type}`)
    }
    response.json({received:true})
}
