const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const userModel = require("./models/user");
const cookieParser = require("cookie-parser");

const port = 5000;
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

async function encryptPassword(password) {
  const saltRounds = 10;
  return bcrypt
    .genSalt(saltRounds)
    .then((salt) => bcrypt.hash(password, salt))
    .catch((err) => {
      console.log(err);
      throw err;
    });
}

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    // console.log({ email, password });

    let user = await userModel.findOne({ email: email });

    if (!user) {
      return res.status(400).send("User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      //console.log(isPasswordValid);
      res.render("homepage", {user: user.name});
    } else {
      res.send("Invalid credentials");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/homepage", async (req, res) => {
  // console.log(req.cookies)
  const user = await userModel.findOne({ email: req.cookies.email });
  res.render("homepage", { user: user.name });
});

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const encryptedPassword = await encryptPassword(password);
    // console.log(encryptedPassword)
    // console.log({name,email,password})
    let createdUser = await userModel.create({
      name: name,
      email: email,
      password: encryptedPassword,
    });
    // console.log(createdUser);
    res.cookie("email", email);
    // console.log(`cookie set`)

    res.redirect("/homepage");
  } catch (err) {
    const errorMessage = err.errorResponse.errmsg;
    console.log(errorMessage);
    res.status(400).json({ error: errorMessage });
  }
});

app.delete("/delete-user/:username", async (req, res) => {
  const username = req.params.username;
  console.log(username);

  try {
    const result = await userModel.deleteOne({ name: username });
    console.log(result);
    res.status(200).send("User deleted successfully");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error deleting user");
  }
});

app.get("/deleteuser", async (req, res) => {
  const useremail = req.cookies.email;
  console.log(useremail);
  const result = await userModel.deleteOne({ email: useremail });
  if (result.deletedCount === 1) {
    console.log("Successfully deleted one document.");
    res.redirect('/')
  } else {
    console.log("No documents matched the query. Deleted 0 documents.");
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
