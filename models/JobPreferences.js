const mongoose = require('mongoose');
const { Schema } = mongoose;

const JobPreferences = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    profileSummary: { type: String },
    skills: { type: [String], default: [] },
    additionalSkills: { type: [String], default: [] },
    roles: { type: [String], default: [] },
    experience: { type: Number, min: 0 },
    currentSalary: { type: Number, min: 0 },
    expectedSalary: { type: Number, min: 0 },
    qualifications: { type: [Schema.Types.Mixed], default: [] },
    resume: { type: String },
    createdAt: { type: Number, default: () => Date.now() },
    updatedAt: { type: Number, default: () => Date.now() },
    pastWorkUrls: { type: [String], default: [] },
});

JobPreferences.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('JobPreferences', JobPreferences);
