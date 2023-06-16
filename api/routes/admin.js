const express = require("express");
const router = express.Router();
const {v4: uuid} = require("uuid")


// получение статистики
router.get("/", async (req, res) => {
 return res.status(401).send('IDK')
});

module.exports = router;