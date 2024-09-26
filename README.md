# Expense Tracker App - Backend
This is the backend for the Expense Tracker App. It provides CRUD (Create, Read, Update, Delete) operations for expenses using Node.js, Express.js, and MongoDB (Mongoose for schema definition).

Features:
Create a new Expense
View all Expenses
Edit an existing Expense
Delete a Expense
Bulk Delete a Expense
Import CSV File
Statistics Using Aggregation
User Authentication

Technologies Used:
Node.js: JavaScript runtime for building the backend.
Express.js: Web framework to handle routes and middleware.
MongoDB: NoSQL database for storing.
Mongoose: ORM for MongoDB, used to define the schema and interact with the database.
Cors: Middleware to enable Cross-Origin Resource Sharing.
dotenv: For managing environment variables.
JWT: Json-web-token for creating and verify token
Csv-parser: Parse the CSV file
Multer: Middleware to uploads files

Requirements
To run this project locally, ensure you have the following installed:

Node.js (v12+): Install Node.js
MongoDB: Install MongoDB locally or use a MongoDB cloud service like MongoDB Atlas.

Installation
Clone the repository to your local machine.
Steps Overview:
Clone the repository: git clone.
Install dependencies: npm install.
Create .env: Add your MongoDB connection string.
Start MongoDB: Ensure MongoDB is running (if local).
Run server: node index.js or nodemon (if nodemon installed).
