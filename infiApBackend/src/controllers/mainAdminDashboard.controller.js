const Company = require("../models/company.model");
const User = require("../models/user.model");
const Config = require("../models/config.model");
const Integration = require("../models/integration.model");
const Activity = require("../models/activity.model");
const SecurityRequest = require("../models/securityRequest.model");
const Notification = require("../models/notification.model");
const SystemAlert = require("../models/systemAlert.model");
const { pushNotifyUsers } = require("../utils/pushNotifier");

const ACTIVE_STAFF_ROLES = ["employee", "manager", "hr", "admin"];
const REQUIRED_INTEGRATIONS = ["cloud", "email", "security"];

const toPositiveInt = (value, fallback) => {
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed <= 0) return fallback;
    return parsed;
};

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizePeriod = (period = "7d") => {
    const map = { "7d": 7, "30d": 30, "90d": 90 };
    return map[period] ? period : "7d";
};

const startOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

const listDays = (start, totalDays) => {
    return Array.from({ length: totalDays }, (_, index) => {
        const d = new Date(start);
        d.setDate(start.getDate() + index);
        return d;
    });
};

const getColorByAlertType = (type) => {
    if (type === "CRITICAL") return "#ef4444";
    if (type === "WARNING") return "#f59e0b";
    if (type === "RESOLVED") return "#22c55e";
    return "#4f46e5";
};

const isIntegrationConfigured = (type, integration) => {
    if (!integration) return false;

    if (type === "cloud") {
        return Boolean(integration.provider && integration.accessKey && integration.secretKey && integration.region);
    }

    if (type === "email") {
        return Boolean(integration.host && integration.port && integration.email && integration.password);
    }

    if (type === "security") {
        return (
            typeof integration.enable2FA === "boolean"
            || Number.isFinite(integration.sessionTimeout)
            || (Array.isArray(integration.ipWhitelist) && integration.ipWhitelist.length > 0)
        );
    }

    return false;
};

const buildIntegrationStatusItem = (type, integration) => {
    const configured = isIntegrationConfigured(type, integration);
    return {
        type,
        provider: integration?.provider || (type === "security" ? "custom" : null),
        status: configured ? "connected" : "not_configured",
        connectionHealth: {
            status: configured ? "healthy" : "warning",
            latencyMs: null,
            errorRate: null
        },
        lastUpdatedAt: integration?.updatedAt || null,
        config: type === "security"
            ? {
                enable2FA: integration?.enable2FA ?? null,
                sessionTimeout: integration?.sessionTimeout ?? null,
                ipWhitelistCount: Array.isArray(integration?.ipWhitelist) ? integration.ipWhitelist.length : 0
            }
            : undefined
    };
};

const buildSystemHealth = ({ config, integrationStatuses }) => {
    const connected = integrationStatuses.filter((item) => item.status === "connected").length;
    const maintenanceMode = Boolean(config?.maintenanceMode);

    let status = "healthy";
    if (maintenanceMode) status = "maintenance";
    else if (connected < REQUIRED_INTEGRATIONS.length) status = "degraded";

    return {
        status,
        maintenanceMode,
        uptimePercentage: maintenanceMode ? 95.0 : 99.9,
        processUptimeSeconds: Math.floor(process.uptime()),
        integrationsConnected: connected,
        integrationsExpected: REQUIRED_INTEGRATIONS.length,
        checkedAt: new Date()
    };
};

const upsertGeneratedAlerts = async () => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));

    const [config, pendingSecurityRequests, recentSystemIssueCount] = await Promise.all([
        Config.findOne().lean(),
        SecurityRequest.countDocuments({ status: "pending" }),
        Activity.countDocuments({
            type: "System",
            createdAt: { $gte: oneDayAgo },
            $or: [
                { title: { $regex: "latency|timeout|error|failed", $options: "i" } },
                { message: { $regex: "latency|timeout|error|failed", $options: "i" } }
            ]
        })
    ]);

    const maintenanceMode = Boolean(config?.maintenanceMode);
    const hasLatencySpike = recentSystemIssueCount >= 3;
    const securityAuditPassed = pendingSecurityRequests === 0;

    const generated = [
        {
            alertKey: "API_LATENCY_SPIKE",
            type: hasLatencySpike ? "WARNING" : "RESOLVED",
            severity: hasLatencySpike ? 2 : 4,
            title: "API Latency Spike",
            description: hasLatencySpike
                ? "System logs indicate repeated timeout or latency events in the last 24 hours."
                : "API latency is stable based on recent system activity logs.",
            source: "api",
            affectedServices: ["API"],
            status: hasLatencySpike ? "active" : "resolved",
            actions: hasLatencySpike
                ? [{ label: "View Logs", action: "VIEW_LOGS" }]
                : [{ label: "View Details", action: "VIEW_DETAILS" }],
            resolvedAt: hasLatencySpike ? null : now
        },
        {
            alertKey: "SYSTEM_MAINTENANCE",
            type: maintenanceMode ? "WARNING" : "RESOLVED",
            severity: maintenanceMode ? 2 : 4,
            title: "System Maintenance",
            description: maintenanceMode
                ? "Platform maintenance mode is enabled. Some operations may be temporarily restricted."
                : "No active maintenance window is currently enabled.",
            source: "platform",
            affectedServices: ["Dashboard", "API"],
            status: maintenanceMode ? "active" : "resolved",
            actions: [{ label: "View Config", action: "VIEW_CONFIG" }],
            resolvedAt: maintenanceMode ? null : now
        },
        {
            alertKey: "SECURITY_AUDIT_PASSED",
            type: securityAuditPassed ? "INFORMATION" : "WARNING",
            severity: securityAuditPassed ? 4 : 2,
            title: "Security Audit Passed",
            description: securityAuditPassed
                ? "No pending security approval requests were found."
                : `${pendingSecurityRequests} security approval request(s) are pending review.`,
            source: "security",
            affectedServices: ["Auth", "Access Control"],
            status: securityAuditPassed ? "resolved" : "active",
            actions: [{ label: "Open Security Requests", action: "OPEN_SECURITY_REQUESTS" }],
            resolvedAt: securityAuditPassed ? now : null
        }
    ];

    await Promise.all(generated.map((alert) => {
        return SystemAlert.findOneAndUpdate(
            { alertKey: alert.alertKey },
            alert,
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
    }));
};

exports.getHomeSummary = async (req, res) => {
    try {
        const now = new Date();
        const last24Hours = new Date(now.getTime() - (24 * 60 * 60 * 1000));

        const [
            totalCompanies,
            totalEmployees,
            totalHRManagers,
            activeUsers,
            pendingUsers,
            configuredCompanyIds,
            config,
            integrations,
            criticalAlerts
        ] = await Promise.all([
            Company.countDocuments(),
            User.countDocuments({ role: "employee" }),
            User.countDocuments({ role: "hr" }),
            User.countDocuments({
                updatedAt: { $gte: last24Hours },
                status: { $ne: "Terminate" }
            }),
            User.countDocuments({ isEmailVerified: false }),
            User.distinct("companyId", { role: { $in: ["admin", "hr"] }, companyId: { $ne: null } }),
            Config.findOne().lean(),
            Integration.find({ type: { $in: REQUIRED_INTEGRATIONS } }).lean(),
            SystemAlert.countDocuments({ type: "CRITICAL", status: { $ne: "resolved" } })
        ]);

        const validCompanyIds = configuredCompanyIds.filter(Boolean);
        const pendingCompanies = validCompanyIds.length > 0
            ? await Company.countDocuments({ _id: { $nin: validCompanyIds } })
            : totalCompanies;

        const integrationStatuses = REQUIRED_INTEGRATIONS.map((type) => {
            const integration = integrations.find((entry) => entry.type === type);
            return buildIntegrationStatusItem(type, integration);
        });

        const systemHealth = buildSystemHealth({ config, integrationStatuses });

        return res.status(200).json({
            success: true,
            data: {
                totalCompanies,
                totalEmployees,
                totalHRManagers,
                activeUsers,
                pendingRegistration: {
                    total: pendingUsers + pendingCompanies,
                    users: pendingUsers,
                    companies: pendingCompanies
                },
                systemHealth,
                criticalAlerts
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch home summary", error: error.message });
    }
};

exports.getPlatformActivityGraph = async (req, res) => {
    try {
        const period = normalizePeriod(req.query.period);
        const totalDays = parseInt(period, 10);
        const today = startOfDay(new Date());
        const rangeStart = new Date(today);
        rangeStart.setDate(today.getDate() - (totalDays - 1));

        const [dailyAggregation, byType, uniqueUsers] = await Promise.all([
            Activity.aggregate([
                {
                    $match: {
                        createdAt: { $gte: rangeStart }
                    }
                },
                {
                    $group: {
                        _id: {
                            day: {
                                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                            }
                        },
                        totalActivities: { $sum: 1 },
                        systemEvents: {
                            $sum: {
                                $cond: [{ $eq: ["$type", "System"] }, 1, 0]
                            }
                        },
                        uniqueUsers: { $addToSet: "$userAccount" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        day: "$_id.day",
                        totalActivities: 1,
                        systemEvents: 1,
                        activeUsers: {
                            $size: {
                                $setDifference: ["$uniqueUsers", [null]]
                            }
                        }
                    }
                }
            ]),
            Activity.aggregate([
                {
                    $match: {
                        createdAt: { $gte: rangeStart }
                    }
                },
                {
                    $group: {
                        _id: "$type",
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        type: "$_id",
                        count: 1
                    }
                },
                { $sort: { count: -1 } }
            ]),
            Activity.distinct("userAccount", { createdAt: { $gte: rangeStart }, userAccount: { $ne: null } })
        ]);

        const activityByDay = new Map(dailyAggregation.map((item) => [item.day, item]));
        const labels = listDays(rangeStart, totalDays);

        const points = labels.map((dayDate) => {
            const day = dayDate.toISOString().slice(0, 10);
            const existing = activityByDay.get(day);
            return {
                date: day,
                activities: existing?.totalActivities || 0,
                activeUsers: existing?.activeUsers || 0,
                systemEvents: existing?.systemEvents || 0
            };
        });

        const totals = points.reduce(
            (acc, item) => {
                acc.activities += item.activities;
                acc.systemEvents += item.systemEvents;
                return acc;
            },
            { activities: 0, systemEvents: 0 }
        );

        return res.status(200).json({
            success: true,
            data: {
                period,
                points,
                summary: {
                    totalActivities: totals.activities,
                    totalSystemEvents: totals.systemEvents,
                    uniqueActiveUsers: uniqueUsers.length,
                    averageDailyActivities: Number((totals.activities / totalDays).toFixed(2))
                },
                byType
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch platform activity", error: error.message });
    }
};

exports.getRegisteredCompanies = async (req, res) => {
    try {
        const page = toPositiveInt(req.query.page, 1);
        const limit = Math.min(toPositiveInt(req.query.limit, 20), 100);
        const search = String(req.query.search || "").trim();
        const sortBy = ["createdAt", "companyName", "totalEmployees"].includes(req.query.sortBy)
            ? req.query.sortBy
            : "createdAt";
        const sortOrder = String(req.query.sortOrder || "desc").toLowerCase() === "asc" ? 1 : -1;

        const filter = {};
        if (search) {
            const safeSearch = escapeRegex(search);
            filter.$or = [
                { companyName: { $regex: safeSearch, $options: "i" } },
                { email: { $regex: safeSearch, $options: "i" } },
                { industry: { $regex: safeSearch, $options: "i" } }
            ];
        }

        const skip = (page - 1) * limit;

        const [companies, total] = await Promise.all([
            Company.find(filter).sort({ [sortBy]: sortOrder }).skip(skip).limit(limit).lean(),
            Company.countDocuments(filter)
        ]);

        const companyIds = companies.map((company) => company._id);
        const [roleCounts, activeCounts, lastActivityByCompany] = await Promise.all([
            User.aggregate([
                { $match: { companyId: { $in: companyIds } } },
                {
                    $group: {
                        _id: {
                            companyId: "$companyId",
                            role: "$role"
                        },
                        count: { $sum: 1 }
                    }
                }
            ]),
            User.aggregate([
                {
                    $match: {
                        companyId: { $in: companyIds },
                        status: "Active"
                    }
                },
                {
                    $group: {
                        _id: "$companyId",
                        activeUsers: { $sum: 1 }
                    }
                }
            ]),
            User.aggregate([
                { $match: { companyId: { $in: companyIds } } },
                {
                    $group: {
                        _id: "$companyId",
                        lastUserActivityAt: { $max: "$updatedAt" }
                    }
                }
            ])
        ]);

        const roleCountMap = new Map();
        roleCounts.forEach((entry) => {
            const key = String(entry._id.companyId);
            if (!roleCountMap.has(key)) {
                roleCountMap.set(key, { admin: 0, hr: 0, employee: 0, manager: 0, superadmin: 0 });
            }
            roleCountMap.get(key)[entry._id.role] = entry.count;
        });

        const activeCountMap = new Map(activeCounts.map((entry) => [String(entry._id), entry.activeUsers]));
        const lastActivityMap = new Map(lastActivityByCompany.map((entry) => [String(entry._id), entry.lastUserActivityAt]));

        const formattedCompanies = companies.map((company) => {
            const roleStats = roleCountMap.get(String(company._id)) || { admin: 0, hr: 0, employee: 0, manager: 0, superadmin: 0 };
            const registrationStatus = roleStats.admin > 0 || roleStats.hr > 0 ? "active" : "pending_setup";

            return {
                id: company._id,
                companyName: company.companyName,
                email: company.email,
                phone: company.phone,
                address: company.address,
                industry: company.industry,
                size: company.size,
                totalEmployees: company.totalEmployees,
                country: company.country,
                plan: company.plan,
                status: company.status,
                subdomain: company.subdomain,
                primaryColor: company.primaryColor,
                logo: company.logo,
                registrationStatus,
                userStats: {
                    admins: roleStats.admin,
                    hrManagers: roleStats.hr,
                    employees: roleStats.employee,
                    managers: roleStats.manager,
                    activeUsers: activeCountMap.get(String(company._id)) || 0
                },
                createdAt: company.createdAt,
                updatedAt: company.updatedAt,
                lastActivityAt: lastActivityMap.get(String(company._id)) || company.updatedAt
            };
        });

        return res.status(200).json({
            success: true,
            data: {
                companies: formattedCompanies,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch registered companies", error: error.message });
    }
};

exports.getSystemIntegrationStatus = async (req, res) => {
    try {
        const integrations = await Integration.find({ type: { $in: REQUIRED_INTEGRATIONS } }).lean();

        const items = REQUIRED_INTEGRATIONS.map((type) => {
            const integration = integrations.find((entry) => entry.type === type);
            return buildIntegrationStatusItem(type, integration);
        });

        const connected = items.filter((item) => item.status === "connected").length;

        return res.status(200).json({
            success: true,
            data: {
                integrations: items,
                summary: {
                    total: REQUIRED_INTEGRATIONS.length,
                    connected,
                    notConfigured: REQUIRED_INTEGRATIONS.length - connected
                }
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch integration status", error: error.message });
    }
};

exports.getSystemAlerts = async (req, res) => {
    try {
        await upsertGeneratedAlerts();

        const page = toPositiveInt(req.query.page, 1);
        const limit = Math.min(toPositiveInt(req.query.limit, 20), 100);
        const type = String(req.query.type || "").trim().toUpperCase();
        const status = String(req.query.status || "").trim().toLowerCase();
        const search = String(req.query.search || "").trim();

        const filter = {};
        if (["CRITICAL", "WARNING", "INFORMATION", "RESOLVED"].includes(type)) {
            filter.type = type;
        }
        if (["active", "acknowledged", "resolved"].includes(status)) {
            filter.status = status;
        }
        if (search) {
            const safeSearch = escapeRegex(search);
            filter.$or = [
                { title: { $regex: safeSearch, $options: "i" } },
                { description: { $regex: safeSearch, $options: "i" } },
                { source: { $regex: safeSearch, $options: "i" } }
            ];
        }

        const skip = (page - 1) * limit;

        const [alerts, total, typeStats] = await Promise.all([
            SystemAlert.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("acknowledgedBy", "name email role")
                .lean(),
            SystemAlert.countDocuments(filter),
            SystemAlert.aggregate([
                {
                    $group: {
                        _id: "$type",
                        count: { $sum: 1 }
                    }
                }
            ])
        ]);

        const stats = { total: 0, critical: 0, warning: 0, information: 0, resolved: 0 };
        typeStats.forEach((item) => {
            stats.total += item.count;
            if (item._id === "CRITICAL") stats.critical = item.count;
            if (item._id === "WARNING") stats.warning = item.count;
            if (item._id === "INFORMATION") stats.information = item.count;
            if (item._id === "RESOLVED") stats.resolved = item.count;
        });

        const formattedAlerts = alerts.map((alert) => ({
            id: alert._id,
            alertKey: alert.alertKey,
            type: alert.type,
            severity: alert.severity,
            title: alert.title,
            description: alert.description,
            source: alert.source,
            affectedServices: alert.affectedServices || [],
            status: alert.status,
            actions: alert.actions || [],
            createdAt: alert.createdAt,
            updatedAt: alert.updatedAt,
            resolvedAt: alert.resolvedAt,
            acknowledgedAt: alert.acknowledgedAt,
            acknowledgedBy: alert.acknowledgedBy || null,
            color: getColorByAlertType(alert.type)
        }));

        return res.status(200).json({
            success: true,
            data: {
                stats,
                alerts: formattedAlerts,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch system alerts", error: error.message });
    }
};

exports.acknowledgeSystemAlert = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        const alert = await SystemAlert.findById(id);
        if (!alert) {
            return res.status(404).json({ success: false, message: "Alert not found" });
        }

        alert.status = "acknowledged";
        alert.acknowledgedAt = new Date();
        alert.acknowledgedBy = req.user?._id;

        if (notes) {
            alert.description = `${alert.description}\n\nAcknowledgement Notes: ${String(notes).trim()}`;
        }

        await alert.save();

        return res.status(200).json({
            success: true,
            message: "Alert acknowledged",
            data: {
                id: alert._id,
                status: alert.status,
                acknowledgedAt: alert.acknowledgedAt
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to acknowledge alert", error: error.message });
    }
};

exports.quickAddCompany = async (req, res) => {
    try {
        const { companyName, email, phone, address, industry, totalEmployees, admin } = req.body;

        if (!companyName || !email) {
            return res.status(400).json({ success: false, message: "companyName and email are required" });
        }

        const existingCompany = await Company.findOne({ email: String(email).toLowerCase().trim() });
        if (existingCompany) {
            return res.status(409).json({ success: false, message: "Company with this email already exists" });
        }

        const company = await Company.create({
            companyName,
            email: String(email).toLowerCase().trim(),
            phone,
            address,
            industry,
            totalEmployees: Number.isFinite(Number(totalEmployees)) ? Number(totalEmployees) : 0
        });

        let adminUser = null;
        if (admin && admin.name && admin.email && admin.password) {
            const existingAdmin = await User.findOne({ email: String(admin.email).toLowerCase().trim() });
            if (existingAdmin) {
                return res.status(409).json({ success: false, message: "Admin email already exists" });
            }

            adminUser = await User.create({
                name: admin.name,
                email: String(admin.email).toLowerCase().trim(),
                password: admin.password,
                role: "admin",
                companyId: company._id,
                isEmailVerified: true
            });
        }

        await Activity.create({
            type: "System",
            title: "Company Added",
            message: `Company ${company.companyName} was added by main admin`,
            userAccount: req.user?._id,
            icon: "business",
            color: "#2563eb"
        });

        return res.status(201).json({
            success: true,
            message: "Company added successfully",
            data: {
                company,
                admin: adminUser
                    ? {
                        id: adminUser._id,
                        name: adminUser.name,
                        email: adminUser.email,
                        role: adminUser.role
                    }
                    : null
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to add company", error: error.message });
    }
};

exports.getPreviousUsersInfo = async (req, res) => {
    try {
        const page = toPositiveInt(req.query.page, 1);
        const limit = Math.min(toPositiveInt(req.query.limit, 20), 100);
        const role = String(req.query.role || "").trim().toLowerCase();
        const search = String(req.query.search || "").trim();

        const filter = {};
        if (["employee", "manager", "hr", "admin", "superadmin"].includes(role)) {
            filter.role = role;
        }

        if (search) {
            const safeSearch = escapeRegex(search);
            filter.$or = [
                { name: { $regex: safeSearch, $options: "i" } },
                { email: { $regex: safeSearch, $options: "i" } },
                { employeeId: { $regex: safeSearch, $options: "i" } }
            ];
        }

        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            User.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select("name email role status employeeId department designation companyId isEmailVerified createdAt updatedAt")
                .populate("companyId", "companyName email industry")
                .lean(),
            User.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            data: {
                users,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch previous users info", error: error.message });
    }
};

exports.runDeepAudit = async (req, res) => {
    try {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));

        const [config, integrations, pendingSecurityRequests, rejectedSecurityRequests, failedSystemOps, latencySignals, criticalAlerts] = await Promise.all([
            Config.findOne().lean(),
            Integration.find({ type: { $in: REQUIRED_INTEGRATIONS } }).lean(),
            SecurityRequest.countDocuments({ status: "pending" }),
            SecurityRequest.countDocuments({ status: "rejected", updatedAt: { $gte: thirtyDaysAgo } }),
            Activity.countDocuments({
                type: "System",
                createdAt: { $gte: sevenDaysAgo },
                $or: [
                    { title: { $regex: "failed|error|exception", $options: "i" } },
                    { message: { $regex: "failed|error|exception", $options: "i" } }
                ]
            }),
            Activity.countDocuments({
                type: "System",
                createdAt: { $gte: oneDayAgo },
                $or: [
                    { title: { $regex: "latency|timeout|slow", $options: "i" } },
                    { message: { $regex: "latency|timeout|slow", $options: "i" } }
                ]
            }),
            SystemAlert.countDocuments({ type: "CRITICAL", status: { $ne: "resolved" } })
        ]);

        const critical = [];
        const warning = [];
        const info = [];

        if (pendingSecurityRequests > 10) {
            critical.push(`High pending security approvals: ${pendingSecurityRequests}`);
        } else if (pendingSecurityRequests > 0) {
            warning.push(`Pending security approvals: ${pendingSecurityRequests}`);
        } else {
            info.push("No pending security approvals");
        }

        const integrationStatuses = REQUIRED_INTEGRATIONS.map((type) => {
            const integration = integrations.find((entry) => entry.type === type);
            return buildIntegrationStatusItem(type, integration);
        });
        const missingIntegrations = integrationStatuses.filter((item) => item.status !== "connected").map((item) => item.type);

        if (missingIntegrations.length > 0) {
            critical.push(`Missing integrations: ${missingIntegrations.join(", ")}`);
        } else {
            info.push("All required integrations are configured");
        }

        if (failedSystemOps > 10) {
            critical.push(`High failed system operations in last 7 days: ${failedSystemOps}`);
        } else if (failedSystemOps > 0) {
            warning.push(`Failed system operations in last 7 days: ${failedSystemOps}`);
        } else {
            info.push("No failed system operations in last 7 days");
        }

        if (latencySignals > 5) {
            critical.push(`Latency spike signals in last 24 hours: ${latencySignals}`);
        } else if (latencySignals > 0) {
            warning.push(`Latency warnings in last 24 hours: ${latencySignals}`);
        } else {
            info.push("No latency spike signals in last 24 hours");
        }

        if (config?.maintenanceMode) {
            warning.push("Maintenance mode is enabled");
        } else {
            info.push("Maintenance mode is disabled");
        }

        if (criticalAlerts > 0) {
            warning.push(`Open critical alerts: ${criticalAlerts}`);
        } else {
            info.push("No open critical alerts");
        }

        if (rejectedSecurityRequests > 0) {
            warning.push(`Rejected security change requests in last 30 days: ${rejectedSecurityRequests}`);
        }

        const riskScore = Math.min(100, (critical.length * 25) + (warning.length * 10));

        await Activity.create({
            type: "System",
            title: "Deep Audit Executed",
            message: `Main admin ran deep audit with risk score ${riskScore}`,
            userAccount: req.user?._id,
            icon: "shield-checkmark",
            color: "#0ea5e9"
        });

        return res.status(200).json({
            success: true,
            data: {
                scope: ["security", "integrations", "api-latency-signals", "failed-operations"],
                riskScore,
                findings: {
                    critical,
                    warning,
                    info
                },
                generatedAt: new Date()
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to run deep audit", error: error.message });
    }
};

exports.broadcastMessage = async (req, res) => {
    try {
        const {
            category = "announcement",
            headline,
            details,
            targetedAudience = "all_employee",
            targetDepartments = [],
            scheduleAt
        } = req.body;

        if (!headline || !details) {
            return res.status(400).json({ success: false, message: "headline and details are required" });
        }

        if (!["announcement", "policy", "alert"].includes(category)) {
            return res.status(400).json({ success: false, message: "Invalid category" });
        }

        if (!["all_employee", "department", "hr"].includes(targetedAudience)) {
            return res.status(400).json({ success: false, message: "Invalid targetedAudience" });
        }

        const normalizedDepartments = Array.isArray(targetDepartments)
            ? targetDepartments.map((item) => String(item || "").trim()).filter(Boolean)
            : [];

        if (targetedAudience === "department" && normalizedDepartments.length === 0) {
            return res.status(400).json({ success: false, message: "targetDepartments are required for department audience" });
        }

        const scheduleDate = scheduleAt ? new Date(scheduleAt) : null;
        const isScheduled = scheduleDate instanceof Date && !Number.isNaN(scheduleDate.getTime()) && scheduleDate > new Date();

        let sentCount = 0;
        if (!isScheduled) {
            if (targetedAudience === "hr") {
                sentCount = await User.countDocuments({ role: "hr", status: "Active" });
            } else if (targetedAudience === "department") {
                sentCount = await User.countDocuments({
                    role: { $in: ACTIVE_STAFF_ROLES },
                    status: "Active",
                    department: { $in: normalizedDepartments }
                });
            } else {
                sentCount = await User.countDocuments({
                    role: { $in: ACTIVE_STAFF_ROLES },
                    status: "Active"
                });
            }
        }

        const notification = await Notification.create({
            category,
            headline,
            details,
            targetedAudience,
            targetDepartments: normalizedDepartments,
            scheduleAt: isScheduled ? scheduleDate : null,
            status: isScheduled ? "Scheduled" : "Sent",
            sentCount,
            sentBy: req.user?._id
        });

        await Activity.create({
            type: "System",
            title: "Platform Broadcast Sent",
            message: `Broadcast "${headline}" sent to ${targetedAudience}`,
            userAccount: req.user?._id,
            icon: "megaphone",
            color: "#7c3aed"
        });

        // Send push notifications to targeted users (fire-and-forget).
        if (!isScheduled) {
            let targetUserFilter = { status: "Active" };
            if (targetedAudience === "hr") {
                targetUserFilter = { ...targetUserFilter, role: "hr" };
            } else if (targetedAudience === "department") {
                targetUserFilter = {
                    ...targetUserFilter,
                    role: { $in: ACTIVE_STAFF_ROLES },
                    department: { $in: normalizedDepartments }
                };
            } else {
                targetUserFilter = { ...targetUserFilter, role: { $in: ACTIVE_STAFF_ROLES } };
            }
            User.find(targetUserFilter).select("_id").lean().then((users) => {
                const userIds = users.map((u) => u._id);
                if (userIds.length > 0) {
                    pushNotifyUsers(userIds, headline, details, { category, notificationId: String(notification._id), broadcast: true });
                }
            }).catch(() => {});
        }

        return res.status(201).json({
            success: true,
            message: isScheduled ? "Broadcast scheduled successfully" : "Broadcast sent successfully",
            data: {
                notification: {
                    id: notification._id,
                    category: notification.category,
                    headline: notification.headline,
                    details: notification.details,
                    targetedAudience: notification.targetedAudience,
                    targetDepartments: notification.targetDepartments,
                    status: notification.status,
                    sentCount: notification.sentCount,
                    scheduleAt: notification.scheduleAt,
                    createdAt: notification.createdAt
                }
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to broadcast message", error: error.message });
    }
};
