const mongoose = require('mongoose')


const NotifySchema =  new mongoose.Schema({
    superUserPhoneNumber:{
        type:String,
        required: true
    },
    userPhoneNumber:{
        type:String,
        required:true
    },
    duration:{
        type:Number,
        required:true
    },
    notifyType:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
})

module.exports = new mongoose.model('notify',NotifySchema)