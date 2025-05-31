
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserModel } = require('../models/user.model');

const registerUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check if user exists
        const existing = await UserModel.findOne({ email });
        console.log("existing email found", existing);
        if (existing) {
            return res.status(400).send({ message: 'Email already exists' });
        }
        else {
            bcrypt.hash(password, 2, async (err, hashed) => {
                if (hashed) {
                    let newUser = new UserModel({ ...req.body, password: hashed });
                    await newUser.save();
                    res.status(200).send({ message: "Registered Successfully", user: newUser });
                }
                else {
                    res.status(400).send({ message: "Sorry for inconvinence as password is not hashed" });
                }
            })
        }
    } catch (err) {
        res.status(500).send({ message: 'Error registering user', error: err.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const findIfThisEmailIsNotReg = await UserModel.findOne({ email: req.body.email });
        if (!findIfThisEmailIsNotReg) {
            return res.status(400).send({ message: "This EmailId is not registered" });
        }
        else {
            console.log("findIfThisEmailIsNotReg", findIfThisEmailIsNotReg);
            bcrypt.compare(req.body.password, findIfThisEmailIsNotReg.password, (err, result) => {
                if (result) {
                    const token = jwt.sign({ userName: findIfThisEmailIsNotReg.userName, userId: findIfThisEmailIsNotReg._id }, "secretKey");
                    console.log("Generated Token Payload:", jwt.decode(token));
                    res.status(200).send({ message: "Logged Successfully", token: token, user: findIfThisEmailIsNotReg });
                }
                else {
                    res.status(400).send({ "message": "Incorrect Password" });
                }
            })
        }
    } catch (err) {
        res.status(500).send({ msg: 'Error logging in', error: err.message });
    }
};

module.exports = { registerUser, loginUser };