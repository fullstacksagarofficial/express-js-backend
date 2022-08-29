const express = require("express");
const bodyParser = require("body-parser");
const router = new express.Router();
const Product = require("../models/products");
const Category = require("../models/category");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: true });

//get all products
router.get("/product", (req, res) => {
  Product.find()
    .sort("-_id")
    .exec((err, products) => {
      if (err) {
        res.json({ message: err.message, type: "danger" });
      } else {
        (async () => {
          const cat = Category.find({});
          const category = await cat.clone();
          // console.log(category);
          res.render("product/index", {
            title: "Products",
            products: products,
            page_name: "products",
            adminName: req.cookies.admin,
            category: category,
          });
        })();
      }
    });
});

//  image upload
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});
const upload = multer({ storage: storage }).single("img");

//add product
router.post("/addproduct", upload, urlencodedParser, async (req, res, next) => {
  const product = new Product({
    title: req.body.title,
    slug: req.body.slug,
    desc: req.body.desc,
    img: req.file.filename,
    category: req.body.category,
    size: req.body.size,
    color: req.body.color,
    price: req.body.price,
    availableQty: req.body.availableQty,
  });
  // console.log(product);
  await product.save((err) => {
    if (err) {
      res.json({ message: err.message, type: "error" });
    } else {
      req.session.message = {
        type: "success",
        message: "product Added Successfully !",
      };
      res.redirect("/product");
    }
  });
});

//get products
router.get("/product/addproduct", (req, res, next) => {
  res.render("product/addproduct", {
    title: "Add product",
    page_name: "addproduct",
    adminName: req.cookies.admin,
  });
});

//edit product
router.get("/editproduct/:id", async (req, res) => {
  let id = req.params.id;
  Product.findById(id, (err, product) => {
    if (err) {
      res.redirect("/product");
    } else {
      if (product == null) {
        res.redirect("/product");
      } else {
        (async () => {
          const cat = Category.find({});
          const category = await cat.clone();
          // console.log(category);
          res.render("product/editproduct", {
            title: "Edit product",
            product: product,
            page_name: "editproduct",
            adminName: req.cookies.admin,
            category: category,
          });
        })();

        
      }
    }
  });
});

//update product {POST}
router.post(
  "/updateproduct/:id",
  upload,
  urlencodedParser,
  async (req, res, next) => {
    let id = req.params.id;
    let new_image = "";

    if (req.file) {
      new_image = req.file.filename;
      try {
        fs.unlink(
          path.join("./", "uploads", req.body.old_image),
          function (response) {
            // handle the callback
          }
        );
      } catch (error) {
        req.session.message = {
          type: "error",
          message: "Something Went Wrong !",
        };
        res.redirect("/product");
        return false;
      }
    } else {
      new_image = req.body.old_image;
    }

    const product = Product.findByIdAndUpdate(
      id,
      {
        title: req.body.title,
        slug: req.body.slug,
        desc: req.body.desc,
        img: new_image,
        category: req.body.category,
        size: req.body.size,
        color: req.body.color,
        price: req.body.price,
        availableQty: req.body.availableQty,
      },
      (err, result) => {
        if (err) {
          req.session.message = {
            type: "error",
            message: "Something Went Wrong !",
          };
          res.redirect("/product");
        } else {
          req.session.message = {
            type: "success",
            message: "Product Edit Successfully !",
          };
          res.redirect("/product");
        }
      }
    );
  }
);

// delete attribute
router.get("/delete/:productid/:attrid", async (req, res, next) => {
  let productid = req.params.productid;
  let attrid = req.params.attrid;

  await Product.findByIdAndUpdate(
    { _id: productid },
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
  res.redirect("/edit/" + productid);
});

// delete product
router.get("/delete/:id", async (req, res) => {
  let id = req.params.id;

  Product.findByIdAndRemove(id, (err, result) => {
    if (err) {
      res.json({ message: err.message, type: "danger" });
    } else {
      if (result.image != "") {
        try {
          fs.unlinkSync("./uploads/" + result.image);
          req.session.message = {
            type: "success",
            message: "product Deleted  !",
          };
          res.redirect("/");
        } catch (error) {
          console.log(error);
        }
      }
    }
  });
});

//active product {POST}
router.get("/product/active/:id", urlencodedParser, async (req, res, next) => {
  let id = req.params.id;
  const product = Product.findByIdAndUpdate(
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
        res.redirect("/product");
      } else {
        req.session.message = {
          type: "success",
          message: "Product is now active !",
        };
        res.redirect("/product");
      }
    }
  );
});

//inactive product {POST}
router.get(
  "/product/inactive/:id",
  urlencodedParser,
  async (req, res, next) => {
    let id = req.params.id;
    const product = Product.findByIdAndUpdate(
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
          res.redirect("/product");
        } else {
          req.session.message = {
            type: "success",
            message: "Product is now In-active !",
          };
          res.redirect("/product");
        }
      }
    );
  }
);
module.exports = router;
