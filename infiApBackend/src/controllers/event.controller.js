const Event = require("../models/event.model");
const moment = require("moment");

exports.createEvent = async (req, res) => {
  try {
    const { title, date, time, location, description, category, image } = req.body;
    const createdBy = req.user ? req.user._id : req.body.createdBy || null;

    if (!title || !date) return res.status(400).json({ status: "Error", message: "title and date are required" });

    const ev = await Event.create({ title, date: moment(date).toDate(), time, location, description, category, image, createdBy });
    return res.status(200).json({ status: "Success", message: "Event created", data: { id: ev._id } });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: "Failed to create event", error: error.message });
  }
};

exports.listEvents = async (req, res) => {
  try {
    const filter = {};
    if (req.query.type === 'upcoming') {
      filter.date = { $gte: new Date() };
    }
    const events = await Event.find(filter).sort({ date: -1 }).limit(100);
    const data = events.map(e => ({ id: e._id, title: e.title, date: e.date, time: e.time, location: e.location, description: e.description, category: e.category, image: e.image }));
    return res.status(200).json({ status: "Success", data });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: "Failed to list events", error: error.message });
  }
};
