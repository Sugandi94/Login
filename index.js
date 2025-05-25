
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const { readUsers, addUser, editUser } = require('./utils/userManager');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); 
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(session({
  secret: "rahasia123",
  resave: false,
  saveUninitialized: true
}));

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
  const users = readUsers();
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    req.session.loggedin = true;
    req.session.username = username;
    req.session.role = user.role;
    res.redirect("/dashboard");
  } else {
    res.render("login", { error: "Username atau password salah!" });
  }
});

app.get("/dashboard", (req, res) => {
  if (req.session.loggedin) {
    const users = readUsers();
    res.render("dashboard", { 
      username: req.session.username,
      users,
      role: req.session.role
    });
  } else {
    res.redirect("/login");
  }
});

app.post("/add-user", (req, res) => {
  if (req.session.loggedin && req.session.role === 'admin') {
    const { username, password, name } = req.body;
    addUser(username, password, name);
  }
  res.redirect("/dashboard");
});

app.post("/delete-user/:username", (req, res) => {
  if (req.session.loggedin && req.session.role === 'admin') {
    const { username } = req.params;
    deleteUser(username);
  }
  res.redirect("/dashboard");
});

app.post("/edit-user", (req, res) => {
  if (req.session.loggedin && req.session.role === 'admin') {
    const { oldUsername, newUsername, newPassword, newName } = req.body;
    editUser(oldUsername, newUsername, newPassword, newName);
  }
  res.redirect("/dashboard");
});

app.get("/profile", (req, res) => {
  if (req.session.loggedin) {
    const users = readUsers();
    const user = users.find(u => u.username === req.session.username);
    res.render("profile", { 
      user,
      error: null,
      success: null
    });
  } else {
    res.redirect("/login");
  }
});

app.post("/update-profile", (req, res) => {
  if (req.session.loggedin) {
    const { name, newPassword } = req.body;
    const username = req.session.username;
    const users = readUsers();
    const user = users.find(u => u.username === username);
    
    if (user) {
      editUser(username, username, newPassword || user.password, name);
      res.render("profile", {
        user: { ...user, name },
        error: null,
        success: "Profile updated successfully!"
      });
    } else {
      res.render("profile", {
        user: { username },
        error: "Failed to update profile",
        success: null
      });
    }
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server berjalan di http://0.0.0.0:${PORT}`);
});
