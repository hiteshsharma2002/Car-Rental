const express = require("express");
const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");

const bodyparser = require("body-parser");
const urlencoded = bodyparser.urlencoded({ extended: true });
const mong = require("../models/Mongo_User");
const router = express.Router();
const session = require("express-session");

// middleware of session
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// user signup

router.get("/userSignup", function (req, res) {
  res.render("userSignup");
});

// router.post('/userSignup',urlencoded, async (req, res) => {
//     try {
//         const { name, email, pass } = req.body;

//         const newUser = new mong({
//             name, email, pass
//         })

//         const saveUser = await newUser.save();

//         res.render('userLogin');
//     }

//     catch (err) {
//         res.send('Unable to registered,please try again later');
//     }
// })

router.post("/userSignup", urlencoded, async (req, res) => {
  try {
    const { name, email, pass } = req.body;
    const existuser = await mong.findOne({ email });

    if (existuser) {
      return res.status(400).json({ message: "User already exist" });
    }

    const newUser = new mong({
      name,
      email,
      pass,
    });

    const saveUser = await newUser.save();

    // res.render('userLogin');

    return res.status(201).json({ message: "registered successful" });
  } catch (err) {
    res.status(400).json({ message: "server error" });
  }
});

// login

router.get("/userLogin", function (req, res) {
  res.render("userLogin");
});

router.post("/userLogin", urlencoded, async (req, res) => {
  try {
    const { name, email, pass } = req.body;

    const person = await mong.findOne({ email });

    if (!person) {
        res.status(400).json({ message: "server error" });
    }

    if (person.pass === pass) {
      req.session.userEmail = {
        name: person.name,
        email: person.email,
        pass: person.pass,
      };
        // res.send('login successful');
      res.status(200).json({ message: "login successful",user:{name:person.name,email:person.email} });

      // res.redirect(`/user/userdashboard`);
    } else {
    //   res.send("incorrect password");
    res.status(400).json({ message: "incorrect password" });
    }
  } catch (err) {
    // res.send('unable to login');
      // console.log(err);
      res.status(400).json({ message: "server error" });
  }
});

router.get("/userdashboard", function (req, res) {
  if (!req.session.userEmail) {
    res.render("userLogin");
  }
  else {
    const { name, email } = req.session.userEmail;
    res.render("userdashboard", { name, email });
  }

  // res.status(200).json(req.session.userEmail);
  const { name, email } = req.session.userEmail;
    res.json({ name, email });

});

module.exports = router;
