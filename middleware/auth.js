const jwt = require("jsonwebtoken");
const admin = require("../models/admin");

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    
    const verifyadmin = jwt.verify(token, process.env.JWT_VERIFY_TOKEN);
    const adminData = await admin.findOne({
      _id: verifyadmin._id, //_id get from verifyadmin
      "tokens.token": token,
    });

    if (!adminData) {
      req.session.message = {
        type: "info",
        message: "Logged Out !",
      };
      res.redirect("/signin");
    }

    req.token = token;
    // to get admin data
    req.adminData = adminData;
    // console.log(adminData);
    req.adminID = adminData._id;
    next();
  } catch (error) {
    // res.status(401).send(error)
    req.session.message = {
      type: "error",
      message: "Logged Out !",
    };
    res.redirect("/signin");
  }
};

module.exports = auth;
