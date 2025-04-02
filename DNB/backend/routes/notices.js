const express = require("express");
const router = express.Router();
const Notice = require("../models/Notice");
const authMiddleware = require("../middleware/authMiddleware");

// Create Notice
router.post("/", authMiddleware(["admin"]), async (req, res) => {
  const { title, description, category, date, file } = req.body;

  try {
    const notice = new Notice({ title, description, category, date, file });
    await notice.save();
    res.status(201).json(notice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get Notices (With Search & Filter)
router.get("/", async (req, res) => {
  try {
    const { search, category, date } = req.query;
    let query = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    if (category) {
      query.category = category;
    }
    if (date) {
      query.date = {
        $gte: new Date(date),
        $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
      };
    }

    const notices = await Notice.find(query);
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete Notice
router.delete("/:id", authMiddleware(["admin"]), async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });
    res.json({ message: "Notice deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
