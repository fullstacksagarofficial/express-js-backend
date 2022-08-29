//imports
require("dotenv").config();
//database connection
require("./db/conn");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const session = require('express-session')
const auth = require("./middleware/auth")
const admin = require("./routes/admin");
const product = require("./routes/product");
const category = require("./routes/category");
const cookieParser = require("cookie-parser")
const jwt = require("jsonwebtoken");
const PORT = process.env.PORT || 4000;


app.use(express.json())
app.use(cookieParser())  //cookieParser middleware
//to get form data (remove undefined data)
app.use(express.urlencoded({ extended: false }))

//set template engine
app.set("view engine", "ejs");
app.use(express.static("uploads"));
app.use(express.static(__dirname + "/public"));
// Use the session middleware
app.use(session({ secret: "my key", saveUninitialized: true, resave: false }));
app.use((req, res, next) => {
  (res.locals.message = req.session.message), delete req.session.message;
  next();
});

app.use(admin);

// app.use(admin);
app.use(auth,product);
app.use(auth,category);


app.listen(PORT, () => {
  console.log(`Server Started at http://localhost:${PORT}`);
});
