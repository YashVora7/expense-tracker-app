const express = require("express")
const connect = require("./config/db")
const cors = require("cors")
const userRouter = require("./routes/user.route")
const expenseRouter = require("./routes/expense.route")
const {auth} = require("./middleware/auth.middleware")
const app=express()
require("dotenv").config()
const PORT = process.env.PORT

app.use(cors())
app.use(express.json())
app.use("/user",userRouter)
app.use("/expense",auth,expenseRouter)

app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)    
    connect()
})