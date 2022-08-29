const express = require("express");
const bodyParser = require("body-parser");
const router = new express.Router();
const Category = require("../models/category");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: true });

//get all category
router.get("/category", (req, res) => {
  Category.find()
    .sort("-_id")
    .exec((err, category) => {
      if (err) {
        res.json({ message: err.message, type: "danger" });
      } else {
        res.render("category/index", {
          title: "Category",
          page_name: "category",
          category: category,
          adminName:req.cookies.admin
        });
      }
    });
});

//add category
router.post("/addcategory", urlencodedParser, async (req, res, next) => {
  const category = new Category({
    category: req.body.category,
  });
  // console.log(category);
  await category.save((err) => {
    if (err) {
      res.json({ message: err.message, type: "error" });
    } else {
      req.session.message = {
        type: "success",
        message: "Category Added Successfully !",
      };
      res.redirect("/category");
    }
  });
});

//get category
router.get("/category/addcategory", (req, res, next) => {
  res.render("category/addcategory", {
    title: "Add category",
    page_name: "addcategory",
    adminName:req.cookies.admin
  });
});

//edit category
router.get("/editcategory/:id", (req, res) => {
  let id = req.params.id;
  Category.findById(id, (err, category) => {
    if (err) {
      res.redirect("/category");
    } else {
      if (category == null) {
        res.redirect("/category");
      } else {
        res.render("category/editcategory", {
          title: "Edit category",
          category: category,
          page_name: "editcategory",
          adminName:req.cookies.admin
        });
      }
    }
  });
});

//update category {POST}
router.post(
  "/updatecategory/:id",
  urlencodedParser,
  async (req, res, next) => {
    let id = req.params.id;

    const category = Category.findByIdAndUpdate(
      id,
      {
        category: req.body.category,
      },
      (err, result) => {
        if (err) {
          req.session.message = {
            type: "error",
            message: "Something Went Wrong !",
          };
          res.redirect("/category");
        } else {
          req.session.message = {
            type: "success",
            message: "Category Edit Successfully !",
          };
          res.redirect("/category");
        }
      }
    );
  }
);

// delete attribute
router.get("/delete/:categoryid/:attrid", async (req, res, next) => {
  let categoryid = req.params.categoryid;
  let attrid = req.params.attrid;

  await Category.findByIdAndUpdate(
    { _id: categoryid },
    {
      $pull: {
        attributes: {
          _id: attrid,
        },
      },
    }
  );
  req.session.message = {
    type: "success",
    message: "Attribute Deleted  !",
  };
  res.redirect("/edit/" + categoryid);
});

// delete category
router.get("/delete/:id", async (req, res) => {
  let id = req.params.id;

  Category.findByIdAndRemove(id, (err, result) => {
    if (err) {
      res.json({ message: err.message, type: "danger" });
    } else {
      if (result.image != "") {
        try {
          fs.unlinkSync("./uploads/" + result.image);
          req.session.message = {
            type: "success",
            message: "category Deleted  !",
          };
          res.redirect("/");
        } catch (error) {
          console.log(error);
        }
      }
    }
  });
});

//active category {POST}
router.get(
  "/category/active/:id",
  urlencodedParser,
  async (req, res, next) => {
    let id = req.params.id;
    const category = Category.findByIdAndUpdate(
      id,
      {
        status: 1,
      },
      (err, result) => {
        if (err) {
          // res.json({ message: err.message, type: "danger" });
          req.session.message = {
            type: "error",
            message: "Something Went Wrong !",
          };
          res.redirect("/category");
        } else {
          req.session.message = {
            type: "success",
            message: "Category is now active !",
          };
          res.redirect("/category");
        }
      }
    );
  }
);

//inactive category {POST}
router.get(
  "/category/inactive/:id",
  urlencodedParser,
  async (req, res, next) => {
    let id = req.params.id;
    const category = Category.findByIdAndUpdate(
      id,
      {
        status: 0,
      },
      (err, result) => {
        if (err) {
          // res.json({ message: err.message, type: "danger" });
          req.session.message = {
            type: "error",
            message: "Something Went Wrong !",
          };
          res.redirect("/category");
        } else {
          req.session.message = {
            type: "success",
            message: "Category is now In-active !",
          };
          res.redirect("/category");
        }
      }
    );
  }
);
module.exports = router;
