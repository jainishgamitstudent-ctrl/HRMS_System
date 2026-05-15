const mongoose = require('mongoose');
const User = require('./src/models/user.model');
const Department = require('./src/models/department.model');
const Team = require('./src/models/team.model');
const Job = require('./src/models/job.model');
const Candidate = require('./src/models/candidate.model');
const LeaveApplication = require('./src/models/leaveApplication.model');
const connectDB = require('./src/db/db');

async function seed() {
    await connectDB();
    console.log("Seeding started...");

    // 1. Create Departments
    const depts = await Department.create([
        { name: "Engineering", tag: "Tech", tagColor: "#3b82f6" },
        { name: "Marketing", tag: "Growth", tagColor: "#10b981" },
        { name: "Human Resources", tag: "People", tagColor: "#f59e0b" },
    ]);

    // 2. Create Jobs
    const jobs = await Job.create([
        { title: "Senior React Native Developer", dept: "Engineering", type: "Full-time", status: "Active", experience: "5+ years" },
        { title: "Marketing Lead", dept: "Marketing", type: "Full-time", status: "Active", experience: "3+ years" },
        { title: "HR Generalist", dept: "Human Resources", type: "Full-time", status: "Active", experience: "2+ years" }
    ]);

    // 3. Create Candidates
    await Candidate.create([
        { 
            jobId: jobs[0]._id, 
            jobTitle: jobs[0].title, 
            applicantName: "Alex Rivera", 
            email: "alex@example.com", 
            status: "Applied" 
        },
        { 
            jobId: jobs[0]._id, 
            jobTitle: jobs[0].title, 
            applicantName: "Sarah Chen", 
            email: "sarah@example.com", 
            status: "Shortlisted" 
        },
        { 
            jobId: jobs[1]._id, 
            jobTitle: jobs[1].title, 
            applicantName: "Michael Bay", 
            email: "michael@example.com", 
            status: "Applied" 
        }
    ]);

    // 4. Create Users for Leaves
    const testUser = await User.findOne({ role: "employee" });
    if (testUser) {
        await LeaveApplication.create([
            {
                employeeId: testUser._id,
                leaveType: "Sick Leave",
                startDate: new Date(),
                endDate: new Date(Date.now() + 86400000 * 2), // 2 days
                days: 3,
                reason: "High fever",
                status: "Pending"
            },
            {
                employeeId: testUser._id,
                leaveType: "Annual Leave",
                startDate: new Date(Date.now() + 86400000 * 10),
                endDate: new Date(Date.now() + 86400000 * 15),
                days: 5,
                reason: "Family vacation",
                status: "Pending"
            }
        ]);
    }

    // 5. Create Recent Activities
    const Activity = require('./src/models/activity.model');
    await Activity.create([
        {
            type: "Payroll",
            title: "Payroll processed for April",
            message: "March monthly salaries have been disbursed successfully.",
            icon: "card",
            color: "#5a55d2"
        },
        {
            type: "Hire",
            title: "New hire: Marcus Johnson",
            message: "Join us in welcoming Marcus to the Engineering team.",
            icon: "person-add",
            color: "#10b981"
        },
        {
            type: "Meeting",
            title: "Q2 Strategy Announcement",
            message: "Company-wide meeting scheduled for next Monday.",
            icon: "notifications",
            color: "#f59e0b"
        }
    ]);

    console.log("Seeding completed successfully!");
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
