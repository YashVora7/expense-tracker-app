const expenseModel = require("../models/expense.model")
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");

const bulkExpenseAddCSV = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Please upload a CSV file" });
        }

        const filePath = path.join(__dirname, "../uploads", req.file.filename);
        const expenses = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (row) => {
                expenses.push({
                    title: row.title,
                    amount: row.amount,
                    date: row.date,
                    category: row.category,
                    payment_method: row.payment_method,
                    user: req.user.userId
                });
            })
            .on("end", async () => {
                try {
                    const insertedExpenses = await expenseModel.insertMany(expenses);
                    res.status(201).json({ message: "Expenses added successfully", expenses: insertedExpenses });
                } catch (error) {
                    res.status(500).json({ error: "Bulk upload failed", details: error.message });
                }

                fs.unlinkSync(filePath);
            });
    } catch (error) {
        res.status(500).json({ error: "Bulk upload failed", details: error.message });
    }
};

const expenseAdd = async(req,res)=>{
    try {
        let {title, amount, date, category, payment_method} = req.body

        let expense = new expenseModel({
            title,
            amount,
            date,
            category,
            payment_method,
            user:req.user.userId
        })

        await expense.save()
        res.status(201).json({message:"Expense Added Successfully",expense})
    } catch (error) {
        res.status(500).json({error, details:error.message})
    }
}

const expenseGet = async (req, res) => {
    try {
        const { category, startDate, endDate, payment_method, sortBy, order, page = 1, limit = 10 } = req.query;

        let filter = { user: req.user.userId };

        if (category) {
            filter.category = category;
        }

        if (startDate && endDate) {
            filter.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate) 
            };
        }

        if (payment_method) {
            filter.payment_method = payment_method;
        }

        let sortOptions = {};
        if (sortBy) {
            const sortField = sortBy === "amount" || sortBy === "date" ? sortBy : "createdAt";
            sortOptions[sortField] = order === "desc" ? -1 : 1;
        }

        const skip = (page - 1) * limit;
        const totalExpenses = await expenseModel.countDocuments(filter);
        const expenses = await expenseModel.find(filter).sort(sortOptions).skip(skip).limit(Number(limit)); 

        if (!expenses.length) {
            return res.status(404).json({ error: "Expenses Not Found" });
        }

        res.status(200).json({ message: "Your Expenses", totalExpenses, totalPages: Math.ceil(totalExpenses / limit), currentPage: Number(page),expenses });
    } catch (error) {
        res.status(500).json({ error, details: error.message });
    }
};


const expenseGetById = async(req,res)=>{
    try {
        let {id} = req.params

        let expense = await expenseModel.findOne({_id:id,user:req.user.userId})
        if(!expense){
            return res.status(404).json({error:"Expense Not Found"})
        }

        res.status(201).json({message:"Your Requested Expense",expense})
    } catch (error) {
        req.status(500).json({error,details:error.message})
    }
}

const expenseUpdate = async(req,res)=>{
    try {
        let {id} = req.params
        let {title,category,date, amount, payment_method} = req.body

        let updatedExpense = await expenseModel.findOneAndUpdate({_id:id,user:req.user.userId},
            {title,category,date, amount, payment_method},
            {new:true})
            
        if(!updatedExpense){
            return res.status(404).json({error:"Expense Not Found"})
        }
        res.status(201).json({message:"Expense Updated",updatedExpense})
    } catch (error) {
        res.status(500).json({error,details:error.message})
    }
}

const expenseDelete = async(req,res)=>{
    try {
        let {id} = req.params

        let deletedExpense = await expenseModel.findOneAndDelete({_id:id,user:req.user.userId})
        if(!deletedExpense){
            return res.status(404).json({error:"Expense Not Found"})
        }
        res.status(201).json({message:"Expense Deleted",deletedExpense})
    } catch (error) {
        res.status(500).json({error,details:error.message})
    }
}

const expenseDeleteMany = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || !ids.length) {
            return res.status(400).json({ error: "Please provide an array of expense IDs to delete." });
        }

        const deletedExpenses = await expenseModel.deleteMany({
            _id: { $in: ids }, 
            user: req.user.userId 
        });

        if (deletedExpenses.deletedCount === 0) {
            return res.status(404).json({ error: "No matching expenses found to delete." });
        }

        res.status(200).json({
            message: `${deletedExpenses.deletedCount} expense(s) deleted successfully`,
            deletedCount: deletedExpenses.deletedCount
        });
    } catch (error) {
        res.status(500).json({ error, details: error.message });
    }
};

const expenseGetDataAdmin = async(req,res)=>{
    try {
        let expenses = await expenseModel.find()
        if(!expenses.length){
            return res.status(404).json({error:"Expenses Not Found"})
        }
        res.status(201).json({message:"expense Router",expenses})
    } catch (error) {
        res.status(500).json({error,details:error.message})
    }
}

const expenseGetMonthlyStats = async (req, res) => {
    try {
        console.log("User ID:", req.user.userId);

        const userExpenses = await expenseModel.find({ user: req.user.userId });
        console.log("User Expenses:", userExpenses);

        const monthlyStats = await expenseModel.aggregate([
            {
                $match: { user: req.user.userId }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" }
                    },
                    totalAmount: { $sum: "$amount" },
                    totalExpenses: { $count: {} }
                }
            },
            {
                $project: {
                    year: "$_id.year",
                    month: "$_id.month",
                    totalAmount: 1,
                    totalExpenses: 1,
                    _id: 0
                }
            },
            {
                $sort: { year: 1, month: 1 }
            }
        ]);

        console.log("Matched Monthly Stats:", monthlyStats);

        if (!monthlyStats.length) {
            return res.status(404).json({ error: "No monthly stats found" });
        }

        res.status(200).json({ message: "Monthly Statistics", stats: monthlyStats });
    } catch (error) {
        res.status(500).json({ error, details: error.message });
    }
};






module.exports = {expenseAdd,expenseGet, expenseGetById, expenseUpdate, expenseDelete, expenseDeleteMany, expenseGetDataAdmin, bulkExpenseAddCSV, expenseGetMonthlyStats}