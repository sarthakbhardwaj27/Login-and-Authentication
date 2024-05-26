const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const userModel = require("./models/user");

const port = 5000;
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function encryptPassword(password) {
  const saltRounds = 10;
  return bcrypt.genSalt(saltRounds)
  .then((salt => bcrypt.hash(password,salt)))
  .catch(err => {
    console.log(err);
    throw err;
  })
}

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/signup",(req,res)=>{
  res.render("signup");
})

app.post("/login", async (req,res)=>{
  try {
    const { email, password } = req.body;
    console.log({ email, password });
    
    let user = await userModel.findOne({ email: email });
    
    if (!user) {
      return res.status(400).send('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (isPasswordValid) {
      console.log(isPasswordValid);
      res.render('homepage');
    } else {
      res.send('Invalid credentials');
    }
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error');
  }
})

app.get('/homepage',(req,res)=>{
  res.render("homepage")
})

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const encryptedPassword = await encryptPassword(password);
    console.log(encryptedPassword)
    // console.log({name,email,password})
    let createdUser = await userModel.create({
      name: name,
      email: email,
      password: encryptedPassword,
    });
    console.log(createdUser);
    res.redirect('/homepage')
  } catch (err) {
    const errorMessage = err.errorResponse.errmsg;
    console.log(errorMessage);
    res.status(400).json({ error: errorMessage });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
