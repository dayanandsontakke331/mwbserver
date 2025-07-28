const express = require('express');
const User = require('../models/User');
const JobPreferences = require('../models/JobPreferences');
const Jobs = require('../models/Jobs')
const jobApplications = require('../models/JobApplications')
const BookMark = require('../models/BookMark');
const moment = require('moment');


exports.jobSeekers = async (req, res) => {
  try {
    const {
      search = '',
      experience = '',
      page = 1,
      limit = 10,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const pipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $match: {
          ...(experience && { experience: Number(experience) }),
          ...(search && {
            $or: [
              { 'user.firstName': new RegExp(search, 'i') },
              { 'user.lastName': new RegExp(search, 'i') },
              { 'user.email': new RegExp(search, 'i') },
              { 'user.phone': new RegExp(search, 'i') },
              { skills: new RegExp(search, 'i') },
            ]
          })
        }
      },

      {
        $project: {
          _id: '$user._id',
          name: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
          email: '$user.email',
          phone: '$user.phone',
          resume: '$resume',
          experience: 1,
          createdAt: 1,
          skills: {
            $reduce: {
              input: '$skills',
              initialValue: '',
              in: {
                $cond: [
                  { $eq: ['$$value', ''] },
                  '$$this',
                  { $concat: ['$$value', ', ', '$$this'] }
                ]
              }
            }
          }
        }
      },

      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [
            { $skip: Number(skip) },
            { $limit: Number(limit) }
          ],
          total: [{ $count: 'count' }]
        }
      }
    ];

    const result = await JobPreferences.aggregate(pipeline);

    const data = result[0].data;
    const total = result[0].total[0]?.count || 0;

    return res.status(200).json({ data, total });
  } catch (err) {
    console.log('Error in jobSeekers API:', err);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

exports.getPlatformStats = async (req, res) => {
  try {
    const sevenDaysAgo = moment().subtract(7, 'days').toDate();
    console.log("sevenDaysAgo", sevenDaysAgo)

    const jobPostsAgg = await Jobs.aggregate([{ $count: 'count' }]);
    const jobPostsCount = jobPostsAgg[0]?.count || 0;

    const usersAgg = await User.aggregate([{ $match: { role: { $ne: "admin" } } }, { $count: "count" }]);
    const usersCount = usersAgg[0]?.count || 0;

    const applicationsAgg = await jobApplications.aggregate([{ $count: 'count' }]);
    const applicationsCount = applicationsAgg[0]?.count || 0;

    const savedJobsAgg = await BookMark.aggregate([
      { $match: { type: 'jobApplication' } },
      { $count: "count" }
    ]);

    const savedJobsCount = savedJobsAgg[0]?.count || 0;

    const applicationsLast7DaysAgg = await jobApplications.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $count: "count" }
    ]);
    const applicationsLast7DaysCount = applicationsLast7DaysAgg[0]?.count || 0;

    const growthPercent = 15.6;

    return res.json({
      jobPosts: jobPostsCount,
      users: usersCount,
      applications: applicationsCount,
      savedJobs: savedJobsCount,
      applicationsLast7Days: {
        count: applicationsLast7DaysCount,
        growth: growthPercent
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch stats.' });
  }
};




