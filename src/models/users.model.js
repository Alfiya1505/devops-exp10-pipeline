/**
 * In-memory "database" of users.
 *
 * In a real project this file would be replaced by a database client
 * (e.g. Prisma, Mongoose, Sequelize, pg). Keeping it in-memory here
 * keeps the sample dependency-free and easy to run/test.
 */

let users = [
  { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
  { id: 2, name: 'Alan Turing', email: 'alan@example.com' },
];

let nextId = 3;

function getAll() {
  return users;
}

function getById(id) {
  return users.find((u) => u.id === Number(id));
}

function create({ name, email }) {
  const user = { id: nextId++, name, email };
  users.push(user);
  return user;
}

function update(id, { name, email }) {
  const user = getById(id);
  if (!user) return null;
  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  return user;
}

function remove(id) {
  const index = users.findIndex((u) => u.id === Number(id));
  if (index === -1) return false;
  users.splice(index, 1);
  return true;
}

// Exposed only so tests can reset state between test files.
function _reset() {
  users = [
    { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
    { id: 2, name: 'Alan Turing', email: 'alan@example.com' },
  ];
  nextId = 3;
}

module.exports = { getAll, getById, create, update, remove, _reset };
