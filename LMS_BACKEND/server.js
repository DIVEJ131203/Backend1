import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import ConnectDB from './configs/mongodb.js'
import { clerkWebHooks } from './controllers/webhooks.js'

const app=express()
//Connect to db
await ConnectDB()


//MiddleWares
app.use(cors())

//Routes
app.get('/',(req,res)=>{
    res.send("Api working")
})
app.post("/clerk",express.json(),clerkWebHooks)



//Port
const PORT=process.env.PORT || 5000



app.listen(PORT,()=>{
    console.log(`Server running on ${PORT}`)
})