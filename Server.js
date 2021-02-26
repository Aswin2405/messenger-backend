//import
import express from "express"
import mongoose from "mongoose"
import Pusher from "pusher"
import cors from "cors"
import mongoMessages from "./MessageModel.js"

// app config
const app=express()
const port=process.env.PORT||9000

const pusher = new Pusher({
    appId: "1154898",
    key: "3ea20d5a3f203d4a9ce1",
    secret: "6d2ab616b364ea73d41a",
    cluster: "ap2",
    useTLS: true
  });
//middlewares
app.use(express.json())
app.use(cors())
//db config
const mongoURI="mongodb+srv://admin:ExFfBVNmA0mgyEbG@cluster0.xmnav.mongodb.net/messengerDB?retryWrites=true&w=majority"
mongoose.connect(mongoURI,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true
})
mongoose.connection.once("open",()=>{
    console.log("db connected")
    const changeStream=mongoose.connection.collection("messages").watch()
    changeStream.on("change",(change)=>{
        pusher.trigger("messages","newMessage",{
            "change":change
        })
    })
})
//api routes
app.get("/",(req,res)=>res.status(200).send("hello aswin"))
app.post("/save/message",(req,res)=>{
    const dbMessage=req.body
    mongoMessages.create(dbMessage,(err,data)=>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(201).send(data)
        }
    })
})
app.get("/retrieve/conversation",(req,res)=>{
mongoMessages.find((err,data)=>{
    if(err){
        res.status(500).send(err)
    }else{
        data.sort((b,a)=>{
            return a.timestamp-b.timestamp
        })
        res.status(200).send(data)
    }
})
})
//listen
app.listen(port,()=>console.log(`listening on:${port}`))

//ExFfBVNmA0mgyEbG