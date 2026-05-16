require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/user.model');
const SalaryStructure = require('./src/models/salaryStructure.model');
const connectDB = require('./src/db/db');

async function seed() {
    await connectDB();
    console.log("Seeding salary structure data started...");

    // Get active employees (role: employee, manager, hr)
    const employees = await User.find({
        role: { $in: ['employee', 'manager', 'hr'] },
        status: 'Active'
    }).select('_id name');

    if (employees.length === 0) {
        console.log("No employees found. Please seed users first.");
        process.exit(0);
    }

    console.log(`Found ${employees.length} employees`);

    // Fixed salary data - 25,000 per employee
    const monthlyTakeHome = 25000;
    const annualCtc = monthlyTakeHome * 12;

    for (let i = 0; i < employees.length; i++) {
        const emp = employees[i];

        // Check if salary structure already exists
        const existing = await SalaryStructure.findOne({ userId: emp._id });

        if (existing) {
            // Update existing
            existing.annualCtcAmount = annualCtc;
            existing.monthlyTakeHomeAmount = monthlyTakeHome;
            existing.earnings = {
                baseSalary: Math.round(monthlyTakeHome * 0.6),
                totalEarning: monthlyTakeHome
            };
            existing.deductions = {
                pf: Math.round(monthlyTakeHome * 0.05),
                tax: Math.round(monthlyTakeHome * 0.1),
                totalDeduction: Math.round(monthlyTakeHome * 0.15)
            };
            existing.isActive = true;
            await existing.save();
            console.log(`Updated salary for ${emp.name}`);
        } else {
            // Create new
            await SalaryStructure.create({
                userId: emp._id,
                annualCtcAmount: annualCtc,
                monthlyTakeHomeAmount: monthlyTakeHome,
                earnings: {
                    baseSalary: Math.round(monthlyTakeHome * 0.6),
                    totalEarning: monthlyTakeHome
                },
                deductions: {
                    pf: Math.round(monthlyTakeHome * 0.05),
                    tax: Math.round(monthlyTakeHome * 0.1),
                    totalDeduction: Math.round(monthlyTakeHome * 0.15)
                },
                currency: 'INR',
                isActive: true
            });
            console.log(`Created salary for ${emp.name}`);
        }
    }

    // Verify total
    const total = await SalaryStructure.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: '$monthlyTakeHomeAmount' } } }
    ]);

    console.log(`\nTotal Monthly Payroll: ₹${total[0]?.total || 0}`);
    console.log("Salary structure seeding completed successfully!");
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});