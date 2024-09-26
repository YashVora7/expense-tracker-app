const {Router} = require("express")
const { expenseGet, expenseAdd, expenseGetById, expenseUpdate, expenseDelete, expenseGetDataAdmin, bulkExpenseAddCSV, expenseDeleteMany, expenseGetMonthlyStats  } = require("../controllers/expense.controller")
const { adminAuth } = require("../middleware/auth.middleware")
const expenseRouter = Router()
const multer = require("multer");
const path = require("path");

expenseRouter.post("/add", expenseAdd)
expenseRouter.get("/get", expenseGet)
expenseRouter.get("/get/:id", expenseGetById)
expenseRouter.patch("/update/:id", expenseUpdate)
expenseRouter.delete("/delete/:id", expenseDelete)
expenseRouter.delete("/deletemany", expenseDeleteMany)
expenseRouter.get("/admin",adminAuth, expenseGetDataAdmin)

const upload = multer({
    dest: path.join(__dirname, "../uploads"),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
    fileFilter: (req, file, cb) => {
        if (path.extname(file.originalname) !== ".csv") {
            return cb(new Error("Only CSV files are allowed"));
        }
        cb(null, true);
    }
});
expenseRouter.post("/import", upload.single("file"), bulkExpenseAddCSV);
expenseRouter.get("/monthly-stats", expenseGetMonthlyStats);


module.exports = expenseRouter