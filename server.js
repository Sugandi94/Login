const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Simulasi "database" user
const users = [
  { username: "admin", password: "1234" },
  { username: "user", password: "abcd" }
];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(session({
  secret: "rahasia123",
  resave: false,
  saveUninitialized: true
}));

// Routing
app.get("/", (req, res) => {
  if (req.session.loggedin) {
    res.redirect("/dashboard");
  } else {
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    req.session.loggedin = true;
    req.session.username = username;
    res.redirect("/dashboard");
  } else {
    res.render("login", { error: "Username atau password salah!" });
  }
});

app.get("/dashboard", (req, res) => {
  if (req.session.loggedin) {
    res.render("dashboard", { username: req.session.username });
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
