const usersModel = require('../models/users.model');

function listUsers(req, res) {
  res.json(usersModel.getAll());
}

function getUser(req, res) {
  const user = usersModel.getById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
}

function createUser(req, res) {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }
  const user = usersModel.create({ name, email });
  res.status(201).json(user);
}

function updateUser(req, res) {
  const { name, email } = req.body;
  const updated = usersModel.update(req.params.id, { name, email });
  if (!updated) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(updated);
}

function deleteUser(req, res) {
  const deleted = usersModel.remove(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.status(204).send();
}

module.exports = { listUsers, getUser, createUser, updateUser, deleteUser };
