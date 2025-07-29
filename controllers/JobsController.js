
const JobApplications = require('../models/JobApplications');
const Jobs = require('../models/Jobs');

exports.postJob = async (req, res) => {
    try {

        req.body.postedBy = req.user._id;

        let job;

        if (req.body._id) {
            const existingJob = await Jobs.findOne({ _id: req.body._id });

            if (!existingJob) {
                return res.status(404).json({ message: "Job not found", success: false });
            }

            Object.assign(existingJob, req.body);
            job = await existingJob.save();

            return res.status(200).json({ message: "Job updated successfully", success: true, data: job });
        } else {
            job = new Jobs(req.body);
            await job.save();

            return res.status(201).json({ message: "Job posted successfully", success: true, data: job });
        }

    } catch (error) {
        console.log("Error creating/updating job", error);
        return res.status(400).json({ message: "Error creating/updating job", success: false });
    }
};

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
        const userId = req.user._id;

        const jobsApplied = await JobApplications.find({ userId: userId }).select("jobId -_id");

        const appliedJobs = jobsApplied.map((job) => job.jobId);

        const stages = [];

        const matchstage = {
            $match: {
                _id: { $nin: appliedJobs }
            }
        };

        if (search) {
            matchstage.$match.$or = [
                { title: { $regex: search, $options: "i" } },
                { companyName: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ]
        }

        stages.push(matchstage);
        stages.push({ $sort: { createdAt: -1 } });
        stages.push({ $skip: (pageNum - 1) * limitNum });
        stages.push({ $limit: limitNum });

        const jobs = await Jobs.aggregate(stages);

        const count = search
            ? {
                $or: [
                    { title: { $regex: search, $options: "i" } },
                    { companyName: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } }
                ],
                _id: { $nin: appliedJobs }
            }
            : { _id: { $nin: appliedJobs } };

        const totalCount = await Jobs.countDocuments(count);

        return res.status(200).json({
            success: true,
            message: "Jobs fetched successfully",
            data: jobs,
            totalCount
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.getJob = async (req, res) => {
    try {
        const { id } = req.params;

        const job = await Jobs.findOne({ _id: id });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Job fetched successfully',
            data: job,
        });
    } catch (error) {
        console.error('Error fetching job:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while fetching job details',
        });
    }
};
