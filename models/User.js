const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const custom = require('../config/custom');
const { Schema } = require('mongoose')

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, enum: Object.values(custom.roles) },
    city: { type: String },
    company: { type: [Schema.Types.Mixed], default: [] },
    password: { type: String, required: true },
});

userSchema.pre('save', async function (next) {
    let update = this.isModified('password');
    if (!update) {
        console.log("not update")
        return next();
    }

    const SALT = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, SALT);
    next();
});

userSchema.methods.comparePassword = async function (plainPassword) {
    let match = bcrypt.compare(plainPassword, this.password);
    return match;
};

module.exports = mongoose.model('user', userSchema);
