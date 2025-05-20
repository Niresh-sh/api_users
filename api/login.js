const Joi = require('joi');
const express = require('express');
const app = express();
const fs = require('fs');
let logins = require('../registers.json'); // Use 'let' so we can modify it
const cors = require('cors');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('hello world!!');
});

app.get('/api/logins', (req, res) => {
  res.send(logins);
});

app.post('/api/logins', (req, res) => {
  const { error } = validatelogin(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }

  const login = {
    id: logins.length + 1,
    email: req.body.email,
    password: req.body.password
  };
  logins.push(login);

  // ✅ Save to file
  fs.writeFileSync('./registers.json', JSON.stringify(logins, null, 2));

  res.send(login);
});

app.put('/api/logins/:id', (req, res) => {
  const login = logins.find(r => r.id === parseInt(req.params.id));
  if (!login) return res.status(404).send('The login with the given ID was not found.');

  const { error } = validatelogin(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }

  login.email = req.body.email;
  login.password = req.body.password;

  // ✅ Save to file
  fs.writeFileSync('./registers.json', JSON.stringify(logins, null, 2));

  res.send(login);
});

app.delete('/api/logins/:id', (req, res) => {
  const login = logins.find(r => r.id === parseInt(req.params.id));
  if (!login) return res.status(404).send('The login with the given ID was not found.');

  const index = logins.indexOf(login);
  logins.splice(index, 1);

  // ✅ Save to file
  fs.writeFileSync('./logins.json', JSON.stringify(logins, null, 2));

  res.send(login);
});

app.get('/api/logins/:id', (req, res) => {
  const login = logins.find(r => r.id === parseInt(req.params.id));
  if (!login) return res.status(404).send('The login with the given ID was not found.');
  res.send(login);
});

function validatelogin(login) {
  const schema = Joi.object({
    firstName: Joi.string().min(2).max(30).required(),
    lastName: Joi.string().min(2).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.any().valid(Joi.ref('password')).required().messages({
      'any.only': 'Confirm password does not match'
    })
  });

  return schema.validate(login);
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
