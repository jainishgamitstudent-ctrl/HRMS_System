const mongoose = require('mongoose');
const User = require('./src/models/user.model');
const connectDB = require('./src/db/db');

async function seedSuperadmin() {
    await connectDB();
    console.log("Seeding superadmin...");

    const superadminEmail = (process.env.SUPERADMIN_EMAIL || "mriya0619@gmail.com").trim().toLowerCase();

    const existing = await User.findOne({ email: superadminEmail, role: "superadmin" });
    if (existing) {
        console.log(`Superadmin already exists: ${superadminEmail}`);
        process.exit(0);
    }

    await User.create({
        name: "Super Admin",
        email: superadminEmail,
        role: "superadmin",
        isEmailVerified: true,
        status: "Active",
    });

    console.log(`Superadmin created successfully: ${superadminEmail}`);
    process.exit(0);
}

seedSuperadmin().catch(err => {
    console.error("Seed failed:", err);
    process.exit(1);
});
