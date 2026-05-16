const mongoose = require('mongoose');
const User = require('./src/models/user.model');
require('dotenv').config();

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOne({ role: 'employee' });
  console.log("User email:", user.email);
  process.exit(0);
}
test();
