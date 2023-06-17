const express = require("express");
const app = express();
const path = require("path");

const authRoute = require("./routes/auth")
const dictRoute = require("./routes/dictionary")
const statRoute = require("./routes/stat")
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookies = require("cookie-parser");
const checkAuth = require("./middleware/checkAuth")

dotenv.config({ path: `${__dirname}/../.env` });
// app.use(express.json({ extended: false }));
app.use(express.json({ extended: false }));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json());
app.use(cookies());
app.use(cors({
  origin: ["https://dictionary-exp-frontend.vercel.app"],
  methods: ["POST", "GET"],
  credentials: true
}));

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
  })
  .then(console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

app.use('/api/login', authRoute)

app.use('/api/dict', checkAuth, dictRoute)
app.use('/api/stat', checkAuth, statRoute)


app.listen(process.env.PORT || 5000, () => {
  console.log("Backend is running...");
});



// const addData = () => {
//     myDict.words = Dictionary
//     myDict.save()
//     console.log('words added!')
// }

// // addData()