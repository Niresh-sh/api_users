const registers = require('../../../registers.json');

export default function handler(req, res) {
  const { id } = req.query;

  const user = registers.find(r => r.id === parseInt(id));
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.status(200).json(user);
}
