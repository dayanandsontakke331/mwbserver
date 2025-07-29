
const JobPreferences = require("../models/JobPreferences");
const User = require('../models/User');
const custom = require('../config/custom')

exports.jobPreferencesSetting = async (req, res) => {
    try {
        let userId = req.body.userId;
        let reqbody = req.body;
        delete req.body.userId;

        if (!userId) {
            return res.status(400).json({ success: false, message: "Request data missing", data: null });
        }

        let user = await User.findOne({ _id: userId });

        if (user && (user.role === custom.roles.admin) || (user.role === custom.roles.recruiter)) {
            return res.json({ success: false, message: "Cannot set preferences", data: null });
        }

        const existing = await JobPreferences.findOne({ userId });

        if (existing) {
            let preferences = await JobPreferences.findOneAndUpdate({ userId }, { $set: reqbody }, { new: true });
            return res.status(200).json({ success: true, message: "Job preferences updated successfully", data: preferences });
        } else {
            let preferences = await JobPreferences.create({ userId, ...reqbody });
            return res.status(200).json({ success: true, message: "Job preferences saved successfully", data: preferences });
        }

    } catch (err) {
        console.log("Error in updating setting preferences", err);
        return res.status(500).json({ success: false, message: "Error occured", data: null });
    }
};

exports.getJobPreferencesByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const preferences = await JobPreferences.findOne({ userId });

        if (!preferences) {
            return res.status(200).json({ success: false, message: "No preferences found" });
        }

        console.log("preferences", preferences)

        return res.json({ success: true, data: preferences });
    } catch (err) {
        console.log('Error', err);
        return res.status(500).json({ success: false, message: "Something wen't wrong!", data: null });
    }
};

exports.uploadResume = async (req, res) => {
    try {
        const file_path = req.file_path;
        const userId = req.body.id
        const preferences = await JobPreferences.findOneAndUpdate({ userId }, { $set: { resume: file_path } }, { new: true });
        return res.status(200).json({ success: true, message: "Resume uploaded", data: preferences });
    } catch (error) {
        return res.json({ success: false, message: "Error occured while uploading resume", data: null });
    }
}
