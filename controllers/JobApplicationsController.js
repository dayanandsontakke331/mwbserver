const JobApplication = require('../models/JobApplications');
const mongoose = require('mongoose');
const User = require('../models/User');

exports.applyForJob = async (req, res) => {
    try {
        if (!req.body.userId || !req.body.jobId) {
            return res.status(400).json({
                success: false,
                message: `Request data missing`,
                data: null
            });
        }

        let existingApplication = await JobApplication.countDocuments({ userId: req.body.userId, jobId: req.body.jobId });

        if (existingApplication) {
            return res.status(409).json({
                success: false,
                message: 'Already applied for this job',
                data: null
            });
        }

        console.log(new mongoose.Types.ObjectId(req.body.userId));

        const newApplication = new JobApplication({
            userId: new mongoose.Types.ObjectId(req.body.userId),
            jobId: new mongoose.Types.ObjectId(req.body.jobId)
        });

        await newApplication.save();

        return res.status(200).json({
            success: true,
            message: "Application Sent",
            data: newApplication,
        });
    } catch (err) {
        console.log('Error in applyJob', err);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            data: null
        });
    }
}

exports.jobApplications = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const status = req.query.status;

        const pipeline = [{ $match: {} }];

        if (status) {
            pipeline[0]["$match"].status = status;
        }

        // Restrict to users own posts if not admin
        if (req.user.role !== 'admin') {
            pipeline[0]["$match"].postedBy = req.user._id;
        }

        // Lookup user details
        pipeline.push(
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: true
                }
            }
        );

        // Lookup job details
        pipeline.push(
            {
                $lookup: {
                    from: "jobposts",
                    localField: "jobId",
                    foreignField: "_id",
                    as: "job"
                }
            },
            {
                $unwind: {
                    path: "$job",
                    preserveNullAndEmptyArrays: true
                }
            }
        );

        // Lookup job preferences
        pipeline.push(
            {
                $lookup: {
                    from: "jobpreferences",
                    localField: "userId",
                    foreignField: "userId",
                    as: "preferences"
                }
            },
            {
                $unwind: {
                    path: "$preferences",
                    preserveNullAndEmptyArrays: true
                }
            }
        );

        // Sort and paginate
        pipeline.push(
            {
                $sort: { createdAt: -1 }
            },
            {
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: limit }
                    ],
                    totalCount: [
                        { $count: "count" }
                    ]
                }
            }
        );

        const result = await JobApplication.aggregate(pipeline);

        const response = {
            data: result[0].data,
            total: result[0].totalCount[0]?.count || 0,
            page: page,
            totalPages: Math.ceil((result[0].totalCount[0]?.count || 0) / limit)
        };

        return res.json(response);

    } catch (err) {
        console.log("Aggregation error job applications", err);
        return res.status(500).json({ message: "Cannot get applications", success: false, data: null });
    }
};


exports.myApplications = async (req, res) => {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const id = req.user._id;

    const searchMatch = search
        ? { "jobDetails.title": { $regex: search, $options: "i" } }
        : {};

    const stages = [
        {
            $match: { userId: id }
        },
        {
            $lookup: {
                from: "jobposts",
                localField: "jobId",
                foreignField: "_id",
                as: "jobDetails"
            }
        },
        {
            $unwind: "$jobDetails"
        },
        {
            $match: searchMatch
        },
        {
            $facet: {
                data: [
                    {
                        $project: {
                            _id: 1,
                            status: 1,
                            createdAt: 1,
                            updatedAt: 1,
                            "jobDetails.title": 1,
                            "jobDetails.companyName": 1,
                            "jobDetails.skills": 1,
                            "jobDetails.location": 1,
                            "jobDetails.minSalary": 1,
                            "jobDetails.maxSalary": 1,
                            "jobDetails.employmentType": 1,
                            "jobDetails.proficiencyLevel": 1
                        }
                    },
                    { $skip: skip },
                    { $limit: parseInt(limit) }
                ],
                totalCount: [
                    { $count: "count" }
                ]
            }
        }
    ];

    const result = await JobApplication.aggregate(stages);

    const applications = result[0].data;
    const total = result[0].totalCount[0]?.count || 0;

    return res.json({
        message: "Get job application success",
        success: true,
        data: applications,
        total
    });
};




