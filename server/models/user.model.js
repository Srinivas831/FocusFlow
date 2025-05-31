const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    userName: { type: String, required: true, unique: true }, 
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const UserModel= mongoose.model('User', userSchema);
module.exports = { UserModel };