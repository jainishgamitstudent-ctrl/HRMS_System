const mongoose = require("mongoose");

const punchSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        PunchType: {
            type: Number,
            enum: [1, 2, 3, 4, 5], // 1 = in, 2 = out, 3 = reset, 4 = break start, 5 = break end
            required: true,
        },
        Latitude: {
            type: Number,
        },
        Longitude: {
            type: Number,
        },
        IsAway: {
            type: Boolean,
            default: false,
        },
        WorkMode: {
            type: Number,
            enum: [1, 2, 3, 4], // 1 = Office, 2 = WFH, 3 = Meeting mode, 4 = Offside
            default: 1,
        },
        BreakType: {
            type: Number,
            enum: [1, 2], // 1 = Lunch Break, 2 = Short Break
        },
        PunchTime: {
            type: Date,
            default: Date.now,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Punch", punchSchema);
