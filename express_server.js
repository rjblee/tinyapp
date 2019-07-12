
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const emailLookup = require("./email_lookup");
const canYouLogin = require("./canYouLogin");

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};




app.get("/urls", (req, res) => {
  let id = req.cookies["user_id"]
  let foundUser = users[id];
  let templateVars = {
    urls: urlDatabase,
    user: foundUser
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
 // let templateVars = { username: req.cookies["user_id"] };
  res.render("urls_new");
});

app.get("/urls/:shortURL",(req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies["user_id"]]};
  res.render("urls_show", templateVars); 
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls/" + shortURL);
});

function generateRandomString() {
  let random6 = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    random6 += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return random6;
};

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  console.log(req.params.shortURL);
  console.log(urlDatabase);
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/login", (req, res) => {
  res.render("urls_login", {user: null});
});

app.post("/login", (req, res) => {
  const email = req.body.email
  const password = req.body.password
  let matchedUser = "";

  if (typeof canYouLogin (email, password, users) === 'object') {
    matchedUser = canYouLogin (email, password, users);
  } else {
    res.status(403).send("No matched email or password found");
  }

  res.cookie("user_id", matchedUser.id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls"); 
});

app.get("/register", (req, res) => {
  res.render("urls_registration", {user: null});
});


app.post("/register", (req, res) => {
  const renderID =  generateRandomString()

  if (req.body.email === '' || req.body.password === '') {

    return res.status(400).send("Enter Email and Password");
  } 

  if (emailLookup(req.body.email, users)) {
    return res.status(400).send("The email address has already been used. Try another email.");
  } 

  users[renderID] = {
    id: renderID,
    email: req.body.email,
    password: req.body.password
  };

  res.cookie("user_id", renderID);
  res.redirect("/urls");
});

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}
