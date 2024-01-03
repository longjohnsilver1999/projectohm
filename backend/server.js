const express = require("express");
const session = require("express-session");
const path = require("path");
const app = express();
const dotenv = require("dotenv");
const expressLayout = require("express-ejs-layouts");
const MongoStore = require("connect-mongo");
app.use(expressLayout);

dotenv.config();
const flashMiddleWare = require("./config/flash");
const flash = require("connect-flash");
const bodyParser = require("body-parser");
const passport = require("passport");
const passportLocal = require("./config/passport");

const mongoose = require("mongoose");
app.set("view engine", "ejs");

const port = process.env.PORT || 5500;
app.listen(port, (err) => {
  if (err) {
    console.error(err);
  }

  console.log(`port is running ${port}`);
});

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("connected to cluster");
  })
  .catch((err) => {
    console.error(err);
  });

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// For getting the output from req.body(it will parse the upcoming request to String or Arrays).
app.use(bodyParser.urlencoded({ extended: false }));
// For using the file in assets folder.
app.use(express.static("./assets"));

// // Routes
// const authRoutes = require("./routes/authRoutes");
// const employeeRoutes = require("./routes/employeeRoutes");
// const reviewRoutes = require("./routes/reviewRoutes");

// app.use("/auth", authRoutes);
// app.use("/employees", employeeRoutes);
// app.use("/reviews", reviewRoutes);

// app.get("/", (req, res) => {
//   res.render("login");
// });

app.use(
  session({
    name: "ERS",

    secret: "employeeReviewSystem",
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 1000 * 60 * 100,
    },
    store: MongoStore.create(
      {
        mongoUrl: process.env.MONGO_URL,
        autoRemove: "disabled",
      },
      (err) => {
        console.log(err || "connect-mongo setup ok");
      }
    ),
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.setAuthenticatedUser);

app.set("views", path.join(__dirname, "views"));
// Using Connect flash
app.use(flash());
app.use(flashMiddleWare.setFlash);
app.use("/", require("./routes/routes"));
