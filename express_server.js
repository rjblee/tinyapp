
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
//const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const emailLookup = require("./helpers");
const canYouLogin = require("./canYouLogin");
const bcrypt = require("bcrypt");

app.set("view engine", "ejs");
//app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'user_id',
  keys: ['123abc'],
  
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "John" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

function generateRandomString() {
  let random6 = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    random6 += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return random6;
};


app.get("/urls", (req, res) => {
  //let id = req.cookies["user_id"] 
  let id = req.session.user_id;
  let foundUser = users[id];
  let templateVars = {
    urls: urlDatabase,
    user: foundUser
  };
  
  if (foundUser) {
    res.render("urls_index", templateVars);
  } else {
    res.status(403).render("prompt_login", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  //let id = req.cookies["user_id"]
  let id = req.session.user_id;
  let foundUser = users[id];
  let templateVars = {
    user: foundUser
  };

  if (foundUser) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  };

});

app.get("/urls/:shortURL",(req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session.user_id]};
  res.render("urls_show", templateVars); 
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session.user_id};
  console.log(urlDatabase);
  res.redirect("/urls/" + shortURL);
});


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  console.log(req.params.shortURL);
  console.log(urlDatabase);
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let id = req.session.user_id;
  let foundUser = users[id].id;

  if (foundUser === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
    
  } else {
    res.status(403).send("Cannot edit or delete this URL.");
  }
});

app.post("/urls/:shortURL/edit", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
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

  //res.cookie("user_id", matchedUser.id);
  req.session.user_id = matchedUser.id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  //res.clearCookie("user_id");
  req.session.user_id = null;
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

  // Hash the password that we get from the body
  // Save hashedPassword inside users[renderID]

  const hashedPassword = bcrypt.hashSync(req.body.password, 10);

  users[renderID] = {
    id: renderID,
    email: req.body.email,
    password: hashedPassword
  };

  //res.cookie("user_id", renderID);
  req.session.user_id = renderID;
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
};