const mongoose = require('mongoose');
const User = require('./src/models/user.model');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");
  const users = await User.find({}, 'name email role');
  console.log("Users:", JSON.stringify(users, null, 2));
  process.exit(0);
}
run().catch(err => {
  console.error(err);
  process.exit(1);
});
