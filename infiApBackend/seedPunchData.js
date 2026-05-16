require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/user.model');
const Punch = require('./src/models/punch.model');
const connectDB = require('./src/db/db');

async function seed() {
    await connectDB();
    console.log("Seeding punch data started...");

    // Get active employees (role: employee, manager, hr)
    const employees = await User.find({
        role: { $in: ['employee', 'manager', 'hr'] },
        status: 'Active'
    }).select('_id name employeeId');

    if (employees.length === 0) {
        console.log("No employees found. Please seed users first.");
        process.exit(0);
    }

    console.log(`Found ${employees.length} employees`);

    // Create punch records for today
    const today = new Date();
    const workModes = [1, 2, 1, 1, 2]; // 1=Office, 2=WFH

    const punchRecords = [];

    for (let i = 0; i < employees.length; i++) {
        const emp = employees[i];
        const mode = workModes[i % workModes.length];

        // Create check-in (around 9:00 AM)
        const checkInTime = new Date(today);
        checkInTime.setHours(9, Math.floor(Math.random() * 30), 0, 0);

        // Create check-out (around 6:00 PM)
        const checkOutTime = new Date(today);
        checkOutTime.setHours(18, Math.floor(Math.random() * 30), 0, 0);

        // Randomly decide if employee is present (80% chance)
        if (Math.random() > 0.2) {
            // Check-in
            punchRecords.push({
                userId: emp._id,
                PunchType: 1,
                PunchTime: checkInTime,
                WorkMode: mode,
                Latitude: 19.0760 + (Math.random() - 0.5) * 0.01,
                Longitude: 72.8777 + (Math.random() - 0.5) * 0.01,
                IsAway: mode !== 1
            });

            // Check-out
            punchRecords.push({
                userId: emp._id,
                PunchType: 2,
                PunchTime: checkOutTime,
                WorkMode: mode,
                Latitude: 19.0760 + (Math.random() - 0.5) * 0.01,
                Longitude: 72.8777 + (Math.random() - 0.5) * 0.01,
                IsAway: mode !== 1
            });
        }
    }

    // Clear existing punches for today
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    await Punch.deleteMany({
        PunchTime: { $gte: startOfDay, $lte: endOfDay }
    });

    // Insert new punch records
    if (punchRecords.length > 0) {
        await Punch.insertMany(punchRecords);
        console.log(`Created ${punchRecords.length} punch records for ${employees.length} employees`);
    } else {
        console.log("No punch records created (all employees marked absent)");
    }

    console.log("Punch data seeding completed successfully!");
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});