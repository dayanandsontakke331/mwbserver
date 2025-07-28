const mongoose = require('mongoose');
const custom = require('../config/custom')

const jobposts = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    companyName: { type: String, required: true, trim: true },
    skills: [{ type: String, trim: true }],
    additionalSkills: [{ type: String, trim: true }],
    location: { type: String, enum: Object.keys(custom.location), required: true },
    employmentType: {
        type: [String],
        enum: Object.keys(custom.employmentType),
        required: true
    },
    proficiencyLevel: {
        type: String,
        enum: Object.keys(custom.proficiencyLevels),
        default: custom.proficiencyLevels.Associate,
        required: true
    },
    openings: { type: Number, min: 1, required: true },
    locations: [{ type: String, trim: true }],
    minSalary: { type: Number, min: 0 },
    maxSalary: { type: Number, min: 0 },
    isLive: { type: Boolean, default: false },
    status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});


jobposts.pre('save', function (next) {
    const now = Date.now();
    if (!this.createdAt) {
        this.createdAt = now;
    }
    this.updatedAt = now;
    next();
});

module.exports = mongoose.model('jobposts', jobposts);
