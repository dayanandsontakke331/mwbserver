const mongoose = require('mongoose');
const custom = require('../config/custom');
const { Schema } = mongoose;

const JobApplicationSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    status: { type: String, enum: Object.values(custom.jobStatus), default: 'Applied', },
    createdAt: { type: Number, default: () => Date.now() },
    updatedAt: { type: Number, default: () => Date.now() },
});

JobApplicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

JobApplicationSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('JobApplication', JobApplicationSchema);

