// Importing modules
const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();
app.use(express.json());
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
const cors = require("cors");
app.use(
  cors({
    origin: "*",
  })
);

// Server PORT number
let port = process.env.PORT || 3000;

const os = require("os");

app.use("/static", express.static(path.join(__dirname, "./")));
// Create directory and files in OS

function mkdirpath(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);

      let products = fs.readFileSync(
        path.join(__dirname, "/assets/products.json")
      );
      fs.writeFileSync(dirPath + "/data.json", "[]", { flag: "w" });
      fs.writeFileSync(dirPath + "/products.json", products, { flag: "w" });
    }
  } catch (err) {
    console.error(err);
  }
}

// Create folder path

mkdirpath(path.join(os.homedir() + "/shopping-cart"));

//load all files
app.get("/", function (req, res) {
  let indexPath = path.join(__dirname, "./index.html");
  res.sendFile(indexPath);
});

app.get("/*.css", function (req, res) {
  let indexPath = path.join(__dirname, "." + req.url);
  res.sendFile(indexPath);
});

app.get("/*.js", function (req, res) {
  let indexPath = path.join(__dirname, "." + req.url);
  res.sendFile(indexPath);
});

app.get("/assets/*.png", function (req, res) {
  let indexPath = path.join(__dirname, "." + req.url);
  res.sendFile(indexPath);
});

//login
app.post("/get-user", (req, res) => {
  const filePath = path.join(os.homedir() + "/shopping-cart/data.json");
  const fileData = fs.readFileSync(filePath);
  const data = JSON.parse(fileData.toString());
  //user login - if both username and password are correct
  var success = data.some(function (obj) {
    return (
      obj.username === req.body.username && obj.password === req.body.password
    );
  });
  if (success === true) {
    return res.status(200).json({
      id: "success",
      msg: "User logged in",
      username: req.body.username,
    });
  }

  //username does not exist - so signUp
  var no_user = data.some(function (obj) {
    return obj.username === req.body.username;
  });
  if (no_user === false) {
    return res.status(400).json({
      id: "user-wrong",
      msg: "Username does not exist. Please signUp",
    });
  }

  //username exists but password wrong
  var pass_wrong = data.some(function (obj) {
    return (
      obj.username === req.body.username && obj.password != req.body.password
    );
  });
  if (pass_wrong === true) {
    return res.status(200).json({ id: "pass-wrong", msg: "Wrong password!!" });
  }
  res.send(data);
});

//signup
app.post("/post-user", (req, res) => {
  //const { username, password } = req.body;

  let user = {
    username: req.body.username,
    password: req.body.password,
    products: {},
    cart: 0,
  };
  // read current file contents
  const filePath = path.join(os.homedir() + "/shopping-cart/data.json");
  const fileData = fs.readFileSync(filePath);
  const data = JSON.parse(fileData.toString());

  //check user already exists
  var userexists = data.some(function (obj) {
    return obj.username === req.body.username;
  });
  if (userexists === true) {
    return res
      .status(400)
      .json({ id: "username", msg: "Oops!Username is taken!" });
  }

  //check password valid
  var regularExpression = /^.{6,}$/;
  if (!req.body.password.match(regularExpression)) {
    return res.status(400).json({
      id: "password",
      msg: "Password should contain atleast 6 charcters",
    });
  }
  if (userexists === false) {
    //append the new user
    data.push(user);
  }
  // write the file back to users.json
  fs.writeFileSync(filePath, JSON.stringify(data));
  res.status(200).json({
    id: "success",
    msg: "User added successfully",
    username: req.body.username,
  });
});

//shopping page
app.get("/shopping.html", (req, res) => {
  let indexPath = path.join(__dirname, "./shopping.html");
  res.sendFile(indexPath);
});

//thankyou page
app.get("/thankyou.html", (req, res) => {
  let indexPath = path.join(__dirname, "./thankyou.html");
  res.sendFile(indexPath);
});

//loadUserData
app.get("/userData", (req, res) => {
  userData = JSON.parse(
    fs.readFileSync(
      path.join(os.homedir() + "/shopping-cart/data.json"),
      "utf8"
    )
  );
  res.json(userData);
});

//loadInventory
app.get("/inventory", (req, res) => {
  inventory = JSON.parse(
    fs.readFileSync(
      path.join(os.homedir() + "/shopping-cart/products.json"),
      "utf8"
    )
  );
  res.json(inventory);
});

//Updating user data
app.put("/user-data-update", (req, res) => {
  fs.writeFileSync(
    path.join(os.homedir() + "/shopping-cart/data.json"),
    JSON.stringify(req.body)
  );
  res.send(req.body);
});

//Updating inventory data
app.put("/inventory-update", (req, res) => {
  fs.writeFileSync(
    path.join(os.homedir() + "/shopping-cart/products.json"),
    JSON.stringify(req.body)
  );
  res.send(req.body);
});

app.listen(port, () => {
  console.log("Our express server is up on port" + " " + port);
});
