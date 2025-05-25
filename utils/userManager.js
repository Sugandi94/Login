
const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, '../data/users.json');

function readUsers() {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data).users;
  } catch (err) {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify({ users }, null, 2));
}

function addUser(username, password, name) {
  const users = readUsers();
  if (users.find(u => u.username === username)) {
    return false;
  }
  users.push({ username, password, name, role: 'user' });
  writeUsers(users);
  return true;
}

function deleteUser(username) {
  let users = readUsers();
  users = users.filter(u => u.username !== username);
  writeUsers(users);
}

function editUser(oldUsername, newUsername, newPassword, newName) {
  let users = readUsers();
  const userIndex = users.findIndex(u => u.username === oldUsername);
  if (userIndex !== -1) {
    users[userIndex].username = newUsername;
    users[userIndex].name = newName;
    if (newPassword) {
      users[userIndex].password = newPassword;
    }
    writeUsers(users);
    return true;
  }
  return false;
}

module.exports = { readUsers, addUser, deleteUser, editUser };
