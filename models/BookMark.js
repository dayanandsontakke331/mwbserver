const mongoose = require('mongoose');
const custom = require('../config/custom');
const { Schema } = mongoose;

const bookMarkSchema = new Schema({
    type: { type: String, enum: Object.values(custom.bookMarkTypes), required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    job: { type: Schema.Types.ObjectId, ref: 'Job' },
    application: { type: Schema.Types.ObjectId, ref: 'JobApplication' },
    bookMarkedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deleted: { type: Boolean, default: false },
    createdAt: { type: Number, default: () => Date.now() },
    updatedAt: { type: Number, default: () => Date.now() }
});

bookMarkSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('bookmark', bookMarkSchema);
