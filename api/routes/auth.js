const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require('../models/User')

//LOGIN
router.post("/", async (req, res) => {
  console.log('Try to login client side')
    try {
      const user = await User.findOne({ username: req.body.username, password: req.body.password });
      if (!user) {
        return res.status(400).json("User not found, check your login and password!");
      }

      const payload = {
        user: {
          id: user._id,
          username: user.username
        },
      };
  // process.env.JWT_EXPIRES_IN
      jwt.sign(payload, process.env.JWT_SECRET, { expiresIn:  process.env.JWT_EXPIRES_IN}, (err, token) => {
        if (err) {
          console.log(err);
          return res.status(400).json("Error occured");
        } else {
          res.cookie("token", token, { httpOnly: true, maxAge: process.env.JWT_EXPIRES_IN, overwrite: true });
          // return res.status(200).json(token)
          return res.status(200).json(user.username)
        }
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  });
  
  router.post("/logout", async (req, res) => {
    try {
      res.clearCookie("token");
      return res.status(200).json("User logged out");
    } catch (e) {
      console.log(e);
      return res.status(400).json("Error occured");
    }
  });

module.exports = router