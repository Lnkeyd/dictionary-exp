const express = require("express");
const app = express();
const path = require("path");

const authRoute = require("./routes/auth")
const dictRoute = require("./routes/dictionary")
const statRoute = require("./routes/stat")
const adminRoute = require("./routes/admin")
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
// app.use(cors());
app.use(cors({
  origin: ["https://dictionary-exp-frontend.vercel.app", "http://localhost:3000"],
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

// app.use('/api/stat', checkAuth, statRoute)

// С CREDENTIALS
// app.use('/api/admin', checkAuth, adminRoute)
// app.use('/api/admin/users', checkAuth, adminRoute)
// app.use('/api/admin/dictionaries', checkAuth, adminRoute)
// app.use('/api/admin/add-dictionary', checkAuth, adminRoute)

// app.use('/api/admin', adminRoute)
// app.use('/api/admin/users', adminRoute)
// app.use('/api/admin/dictionaries', adminRoute)
// app.use('/api/admin/dictionaries/:id', adminRoute)
// app.use('/api/admin/add-dictionary', adminRoute)


app.listen(process.env.PORT || 5000, () => {
  console.log("Backend is running...");
});