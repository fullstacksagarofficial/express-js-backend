const express = require("express");
const bodyParser = require("body-parser");
const router = new express.Router();
const Admin = require("../models/admin");
const Product = require("../models/products");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
var crypto = require("crypto");
const nodemailer = require("nodemailer");

var urlencodedParser = bodyParser.urlencoded({ extended: false });
//dashboard
router.get("/", auth, async (req, res) => {

  const totalproduct= await Product.find().count();
  res.render("dashboard", { title: "Dashboard", page_name: "dashboard", adminName:req.cookies.admin, totalproduct:totalproduct });
  // const totalproduct= await Product.count()
  
});

router.get("/signup", (req, res) => {
  res.render("signup", { title: "Signup", page_name: "signup" });
});

router.get("/signin", (req, res) => {
  res.render("signin", { title: "Signin", page_name: "signin" });
});
router.get("/forgot-password", (req, res) => {
  res.render("forgot-password", {
    title: "forgot-password",
    page_name: "forgot-password",
  });
});

//get login admin details
router.get("/settings", auth, async (req, res) => {
  //  const adminData= await admindetail(req)
  //   console.log(adminData);
  res.render("admin/index", {
    title: "Setting",
    page_name: "setting",
    admins: req.adminData,
    adminName:req.cookies.admin
  });
});

// update admin

//update admin {POST}
router.post(
  "/update_admin/",
  auth,
  urlencodedParser,
  async (req, res, next) => {
    let id = req.adminData._id.toString();
    const admin = Admin.findByIdAndUpdate(
      id,
      {
        name: req.body.name,
      },
      (err, result) => {
        if (err) {
          req.session.message = {
            type: "error",
            message: "Something Went Wrong",
          };
          res.redirect("/");
        } else {
          req.session.message = {
            type: "success",
            message: "Admin Info Updated !",
          };
          res.redirect("/settings");
        }
      }
    );
  }
);

//reset password {POST}
router.post(
  "/reset_password/",
  auth,
  urlencodedParser,
  async (req, res, next) => {
    let id = req.adminData._id.toString();

    if (req.body.new_password && req.body.confirm_password && req.body.confirm_password !=='') {
      if (req.body.new_password != req.body.confirm_password) {
        req.session.message = {
          type: "info",
          message: "Password Not Match",
        };
        res.redirect("/settings");
      } else {
        const oldpassword = req.body.old_password;
        const adminemail = req.adminData.email;
        const checkemail = await Admin.findOne({ email: adminemail, status: 1 });
        // compare bcrypt password
        const passwordMatch = await bcrypt.compare(
          oldpassword,
          checkemail.password
        );
  
        if (passwordMatch) {
          const password = await bcrypt.hash(req.body.new_password, 10);
          const admin = Admin.findByIdAndUpdate(
            id,
            {
              password: password,
            },
            (err, result) => {
              if (err) {
                req.session.message = {
                  type: "error",
                  message: "Something Went Wrong",
                };
                res.redirect("/settings");
              } else {
                req.session.message = {
                  type: "success",
                  message: "Password Updated ! Login Again",
                };
                res.redirect("/settings");
              }
            }
          );
        } else {
          req.session.message = {
            type: "info",
            message: "Old Password not match !",
          };
          res.redirect("/settings");
        }
      }
    }
    else{
      req.session.message = {
        type: "info",
        message: "All Fields Are Required !",
      };
      res.redirect("/settings");
    }
  }
);

//create a new admin
router.post("/addadmin", urlencodedParser, async (req, res) => {
  try {
    const verifyemailToken = crypto.randomBytes(40).toString("hex");

    var html = process.env.WEB_PATH + "verify/" + verifyemailToken;
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "developer.sagar10@gmail.com",
        pass: "fwaqpwudjihuuvcp", //google app password
      },
    });
    var mailOptions = {
      from: "developer.sagar10@gmail.com",
      to: req.body.email,
      subject: "Verify Email !",
      html: html,
    };

    await transporter.sendMail(mailOptions, async function (error, info) {
      try {
        if (error) {
          req.session.message = {
            type: "error",
            message: "Something Went Wrong",
          };
          res.redirect("/signin");
        } else {
          const admin = new Admin({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            verifyemailToken: verifyemailToken,
          });
          const token = await admin.generateAuthToken();
          const createUser = await admin.save();
          if (createUser) {

            // set cookie
            res.cookie("jwt", token, {
              expires: new Date(Date.now() + 1 * 24 * 3600 * 1000), //set cookie for 1 day
              httpOnly: true,
            });
            req.session.message = {
              type: "success",
              message: "Please verify your account !",
            };
            res.redirect("/signin");
          } else {
            req.session.message = {
              type: "success",
              message: "Something went wrong ! please try again",
            };
            res.redirect("/signup");
          }
        }
      } catch (e) {
        req.session.message = {
          type: "error",
          message: "Something Went Wrong",
        };
        res.redirect("/signin");
      }
    });
  } catch (e) {
    req.session.message = {
      type: "error",
      message: "Please try again !",
    };
    res.redirect("/signup");
  }
});

// admin login
router.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const checkemail = await Admin.findOne({ email: email, status: 1 });
    // compare bcrypt password
    const passwordMatch = await bcrypt.compare(password, checkemail.password);
    const token = await checkemail.generateAuthToken();

    // set cookie
    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 1 * 24 * 3600 * 1000), //set cookie for 1 day
      httpOnly: true,
      // secure:true   apply only on htpps:connection
    });

    res.cookie("admin", checkemail.name, {
      expires: new Date(Date.now() + 1 * 24 * 3600 * 1000), //set cookie for 1 day
      httpOnly: true,
      // secure:true   apply only on htpps:connection
    });
    if (passwordMatch) {
      // return res.status(200).json({ success: true });
      req.session.message = {
        type: "success",
        message: "Login Success !",
      };
      res.redirect("/");
    } else {
      // return res.status(401).json({ success: false, msg: 'invalid credentials' });
      req.session.message = {
        type: "info",
        message: "Invalid Credentials !",
      };
      res.redirect("/signin");
    }
  } catch (error) {
    // return res.status(500).json({ success: false, msg: 'Server error' });
    req.session.message = {
      type: "error",
      message: "Please Try Again !",
    };
    res.redirect("/signin");
  }
});

//logout admin
router.get("/logout", auth, async (req, res) => {
  try {
    res.clearCookie("jwt", { path: "/" });
    // res.status(200).send('User Logout')
    req.session.message = {
      type: "success",
      message: "Logout Success !",
    };
    res.redirect("/signin");
  } catch (e) {
    // res.status(400).send(e);
    req.session.message = {
      type: "error",
      message: "Something Went Wrong !",
    };
    res.redirect("/signin");
  }
});

router.get("/mail", async (req, res) => {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "developer.sagar10@gmail.com",
      pass: "fwaqpwudjihuuvcp", //google app password
    },
  });

  var mailOptions = {
    from: "developer.sagar10@gmail.com",
    to: "dashingsagadewdwefewfwefr10@gmail.com",
    subject: "Sending Email using Node.js",
    text: "That was easy!",
  };

  await transporter.sendMail(mailOptions, function (error, info) {
    try {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    } catch (e) {
      console.log(e);
    }
  });
});

// verify email
router.get("/verify/:verifyemailToken", async (req, res) => {
  let verifyemailToken = req.params.verifyemailToken;
  // console.log(verifyemailToken);

  const adminData = await Admin.findOne({
    verifyemailToken: verifyemailToken, //_id get from verifyadmin
  });

  if (!adminData) {
    req.session.message = {
      type: "info",
      message: "Something Went Wrong! Re-verify",
    };
    res.redirect("/signup");
  } else {
    const adminId = adminData._id.toString();
    // update status to 1
    const product = Admin.findByIdAndUpdate(
      adminId,
      {
        status: 1,
      },
      (err, result) => {
        if (err) {
          req.session.message = {
            type: "info",
            message: "Please Re-verified Again !",
          };
          res.redirect("/signup");
        } else {
          req.session.message = {
            type: "success",
            message: "Email Verified Login Now !",
          };
          res.redirect("/signin");
        }
      }
    );
  }
});
module.exports = router;
