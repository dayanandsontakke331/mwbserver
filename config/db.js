const mongoose = require('mongoose');

const dbURL = `mongodb://127.0.0.1:27017/jobportal`;

const options = {};
mongoose.connect(dbURL, options);
const connection = mongoose.connection;

connection.on('connected', () => {
    console.log('Connected to MongoDB.');
});

connection.on('error', (err) => {
    console.log('Database connection error:', err);
});

console.log("connected to mongodb.");
module.exports = connection;