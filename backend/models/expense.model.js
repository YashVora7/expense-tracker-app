const mongoose = require("mongoose")

const expenseSchema = new mongoose.Schema({
    title: {
        type:String,
        required:true
    },
    amount: {
        type:Number,
        required:true,
        default:0
    },
    date: {
        type:Date,
        required:true,
        default: Date.now
    },
    category: {
        type:String,
        required:true
    },
    payment_method:{
        type:String,
        enum: ['cash','credit'],
        default: 'cash',
        required:true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }

},{timestamps:true})

const expenseModel = mongoose.model("expense",expenseSchema)

module.exports = expenseModel