const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// console.log("Connecting to MongoDB...", process.env.MONGO_URL);
const connection = mongoose.connect(process.env.MONGO_URL);

module.exports = {connection};