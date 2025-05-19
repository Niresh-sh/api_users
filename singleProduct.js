const Joi = require('joi');
const express = require('express');
const app = express();
const fs = require('fs');
let registers = require('./registers.json'); // Use 'let' so we can modify it
const cors = require('cors');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('hello world!!');
});

app.get('/api/registers', (req, res) => {
  res.send(registers);
});

app.post('/api/registers', (req, res) => {
  const { error } = validateRegister(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }

  const register = {
    id: registers.length + 1,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password
  };
  registers.push(register);

  // ✅ Save to file
  fs.writeFileSync('./registers.json', JSON.stringify(registers, null, 2));

  res.send(register);
});

app.put('/api/registers/:id', (req, res) => {
  const register = registers.find(r => r.id === parseInt(req.params.id));
  if (!register) return res.status(404).send('The register with the given ID was not found.');

  const { error } = validateRegister(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }

  register.firstName = req.body.firstName;
  register.lastName = req.body.lastName;
  register.email = req.body.email;
  register.password = req.body.password;

  // ✅ Save to file
  fs.writeFileSync('./registers.json', JSON.stringify(registers, null, 2));

  res.send(register);
});

app.delete('/api/registers/:id', (req, res) => {
  const register = registers.find(r => r.id === parseInt(req.params.id));
  if (!register) return res.status(404).send('The register with the given ID was not found.');

  const index = registers.indexOf(register);
  registers.splice(index, 1);

  // ✅ Save to file
  fs.writeFileSync('./registers.json', JSON.stringify(registers, null, 2));

  res.send(register);
});

app.get('/api/registers/:id', (req, res) => {
  const register = registers.find(r => r.id === parseInt(req.params.id));
  if (!register) return res.status(404).send('The register with the given ID was not found.');
  res.send(register);
});

function validateRegister(register) {
  const schema = Joi.object({
    firstName: Joi.string().min(2).max(30).required(),
    lastName: Joi.string().min(2).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.any().valid(Joi.ref('password')).required().messages({
      'any.only': 'Confirm password does not match'
    })
  });

  return schema.validate(register);
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
