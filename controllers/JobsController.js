
const Jobs = require('../models/Jobs');

exports.postJob = async (req, res) => {
    try {
        console.log(req.user)
        req.body.postedBy = req.user._id;
        const job = new Jobs(req.body);
        await job.save();
        return res.status(201).json({ message: "Job posted successfully", success: true, data: job });
    } catch (error) {
        console.log("error creating job", error);
        return res.status(400).json({ message: "Error creating job", success: false, data: null });
    }
}

exports.getAllJobs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            skills = '',
        } = req.query;

        const role = req.user.role;
        const userId = req.user._id
        const filters = [];

        if (skills) {
            filters.push({
                skills: { $regex: new RegExp(skills, 'i') }
            });
        }

        if (role === 'recruiter' && userId) {
            filters.push({ postedBy: userId });
        }

        const matchStage = filters.length > 0 ? { $and: filters } : {};

        const jobs = await Jobs.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: 'users',
                    localField: 'postedBy',
                    foreignField: '_id',
                    as: 'postedByDetails'
                }
            },
            { $unwind: '$postedByDetails' },
            { $sort: { createdAt: -1 } },
            {
                $facet: {
                    data: [
                        { $skip: (parseInt(page) - 1) * parseInt(limit) },
                        { $limit: parseInt(limit) }
                    ],
                    totalCount: [{ $count: 'count' }]
                }
            }
        ]);

        const data = jobs[0]?.data || [];
        const total = jobs[0]?.totalCount[0]?.count || 0;

        res.status(200).json({
            data,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Internal Server Error', data: null });
    }

}

exports.updateJob = async (req, res) => {
    try {
        const id = req.body.jobId;
        delete req.body.id;
        // req.body.postedBy = req.user.id
        const updated = await Jobs.findByIdAndUpdate(id, { status: req.body.status }, {
            new: true,
            runValidators: true,
        });
        if (!updated) {
            return res.status(404).json({ message: "Invalid Job details", success: false, data: null });
        }
        return res.json({ message: "Job updated successfully", success: true, data: updated });
    } catch (error) {
        console.log("Job update error", error);
        return res.status(400).json({ message: "Error updating job", success: false, data: null });
    }
}

exports.updateJobState = async (req, res) => {

}

exports.getJobs = async (req, res) => {
    try {
        const { search = "", page = 1, limit = 5 } = req.query;

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 5;

        const stages = [];

        if (search) {
            stages.push({
                $match: {
                    $or: [
                        { title: { $regex: search, $options: "i" } },
                        { companyName: { $regex: search, $options: "i" } },
                        { description: { $regex: search, $options: "i" } },
                    ],
                },
            });
        }

        stages.push({ $sort: { createdAt: -1 } });
        stages.push({ $skip: (pageNum - 1) * limitNum });
        stages.push({ $limit: limitNum });

        const jobs = await Jobs.aggregate(stages);

        const totalCount = await Jobs.countDocuments(
            search
                ? {
                    $or: [
                        { title: { $regex: search, $options: "i" } },
                        { companyName: { $regex: search, $options: "i" } },
                        { description: { $regex: search, $options: "i" } },
                    ],
                }
                : {}
        );

        return res.status(200).json({
            success: true,
            message: "Jobs fetched successfully",
            data: jobs,
            totalCount,
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};