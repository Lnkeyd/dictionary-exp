const express = require("express");
const router = express.Router();
const UserModel = require('../models/User')


// создать пользователя
router.post("/", async (req, res) => {
    const {username, password} = req.body
    const newUser = new UserModel({
        username,
        password,
        sessions: [],
        statistics: [],
    })
    try {
        await newUser.save()
        return res.status(200).json("User created!")
    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
});

module.exports = router;
