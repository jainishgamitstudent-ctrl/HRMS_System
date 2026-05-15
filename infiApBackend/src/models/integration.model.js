const mongoose = require("mongoose");

const integrationSchema = new mongoose.Schema(
    {
        type: { type: String, enum: ["cloud", "email", "security"], required: true },
        // Cloud config
        provider: { type: String },
        accessKey: { type: String },
        secretKey: { type: String },
        region: { type: String },
        // Email config
        host: { type: String },
        port: { type: Number },
        email: { type: String },
        password: { type: String },
        // Security config
        enable2FA: { type: Boolean },
        sessionTimeout: { type: Number },
        ipWhitelist: [{ type: String }],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Integration", integrationSchema);
