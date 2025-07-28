const { Types } = require('mongoose');
const User = require('../models/User');
const BookMark = require('../models/BookMark')

exports.createBookMark = async (req, res) => {
    try {
        if (!req.body.type || !req.body.bookMarkedBy) {
            return res.status(400).json({
                success: false,
                message: "Missing required data",
                data: null
            });
        }
        const query = {
            type: req.body.type,
            bookMarkedBy: req.body.bookMarkedBy
        };

        if (req.body.user) {
            query.user = req.body.user
        };

        if (req.body.job) {
            query.job = req.body.job
        };

        if (req.body.application) {
            query.application = req.body.application;
        }

        const existing = await BookMark.findOne(query);
        if (existing) {
            return res.status(200).json({
                success: true,
                message: "Already bookmarked",
                data: existing
            });
        }

        const newBookmark = new BookMark({
            type: req.body.type,
            user: req.body.user ?? null,
            job: req.body.job ?? null,
            application: req.body.application ?? null,
            bookMarkedBy: req.body.bookMarkedBy
        });

        const saved = await newBookmark.save();

        return res.status(201).json({
            success: true,
            message: "Bookmarked successfully",
            data: saved
        });

    } catch (err) {
        console.log("Create Bookmark Error", err);
        return res.status(500).json({
            success: false,
            message: "Error occurred",
            data: null
        });
    }
};


exports.getBookMarks = async (req, res) => {
    try {
        let query = {};

        if (req.user.role !== 'admin') {
            query.bookMarkedBy = req.user._id;
        }

        const bookmarks = await BookMark.find(query)
            .sort({ createdAt: -1 })
            .limit(50)
            .populate("user")
            .populate("job")
            .populate("application");

        return res.status(200).json({
            success: true,
            message: "Bookmarks fetched successfully",
            data: bookmarks
        });
    } catch (error) {
        console.log("Error in getBookMarks", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            data: null
        });
    }
};
