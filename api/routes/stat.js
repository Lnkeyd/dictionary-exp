const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const UserModel = require("../models/User");

// получить статистику
// router.get("/:username")
router.get("/", async (req, res) => {
  const token = req.cookies.token;
  const jwtDecoded = jwt.decode(token);
  console.dir('PARAMS: ' + req.query.username)
  const username = req.query.username;
  if (!username) {
    return res.status(400).send("Пользователя с таким именем не найдено");
  } 
  else if (username !== jwtDecoded.user.username) {
    return res.status(403).send("Вы можете получить статистику только для себя!")
  }
  try {
    const data = await UserModel.findOne({ username: username })
    return res.status(200).json(data.statistics)
  } catch(err) {
    return res.status(400).send(err)
  }
});

module.exports = router;
