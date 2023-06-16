const express = require("express");
const app = express();
const path = require("path");
const userRoute = require("./routes/user")
const authRoute = require("./routes/auth")
const dictRoute = require("./routes/dictionary")
const statRoute = require("./routes/stat")
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookies = require("cookie-parser");
const checkAuth = require("./middleware/checkAuth")

// const DictionaryModel = require('./models/Dictionary');
// const myDict = new DictionaryModel()
// const Dictionary = require("./testData/testData");

dotenv.config({ path: `${__dirname}/../.env` });
// app.use(express.json({ extended: false }));
app.use(express.json());
app.use(bodyParser.json());
app.use(cookies());
app.use(cors({
  origin: ["https://deploy-dict-exp.vercel.app"],
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
app.use('/api/user', userRoute)
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