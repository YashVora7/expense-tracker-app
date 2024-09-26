const userModel = require("../models/user.model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const userSignup = async(req,res)=>{
    try {
        let {name,email,password,role} = req.body

        let user = await userModel.findOne({email})
        if(user){
            return res.status(400).json({error:"User Already Exist"})
        }

        let hashedPassword = await bcrypt.hash(password,5)

        let newUser = await userModel({
            name,
            email,
            password:hashedPassword,
            role
        })

        await newUser.save()
        res.status(201).json({message : "User Registered Successfully",newUser})
        
    } catch (error) {
        res.status(500).json({error, details:error.message})
    }
}

const userLogin = async(req,res)=>{
    try {
        let {email,password} = req.body
        let user = await userModel.findOne({email})

        if(!user){
            return res.status(404).json({error:"User Not Found"})
        }

        let comparePassword = await bcrypt.compare(password,user.password)

        if(!comparePassword){
            return res.status(400).json({error:"Invalid Password"})
        }

        const token = await jwt.sign({userId:user.id, role:user.role},process.env.JWT_SECRET,{expiresIn : "1 hr"})
        res.status(201).json({token,message:"User Logged in Successfully"})
    } catch (error) {
        res.status(500).json({error,details:error.message})
    }
}

module.exports = {userSignup, userLogin}