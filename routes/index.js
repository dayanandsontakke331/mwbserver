const express = require('express');
const verifyToken = require('../middlewares/VerifyToken')
const AuthController = require('../controllers/AuthController');
const JobsController = require('../controllers/JobsController');
const JobApplications = require('../controllers/JobApplicationsController');
const JobPreferences = require('../controllers/JobPreferencesController');
const BookMarkController = require('../controllers/BookMarkController');
const UserController = require('../controllers/UserController')

const upload = require('../middlewares/SaveUploadFiles')

const endpoints = express.Router();

// Auth endpoints
endpoints.post('/register', AuthController.register);
endpoints.post('/login', AuthController.login);
endpoints.post('/refreshToken', AuthController.refreshToken);

// User endpoints
endpoints.get('/jobSeekers', verifyToken, UserController.jobSeekers);
endpoints.get('/getPlatformStats', verifyToken, UserController.getPlatformStats);


// Job Preferences
endpoints.post('/jobPreferencesSetting', verifyToken, JobPreferences.jobPreferencesSetting);
endpoints.put('/jobPreferencesSetting', verifyToken, JobPreferences.jobPreferencesSetting);
endpoints.get('/getJobPreferencesByUser/:userId', verifyToken, JobPreferences.getJobPreferencesByUser);
endpoints.post('/uploadResume', verifyToken, upload({ where: "resume", fileSize: 5 * 1024 * 1024 }), JobPreferences.uploadResume);

// Jobs endpoints
endpoints.post('/jobs/post', verifyToken, JobsController.postJob);
endpoints.post('/jobs/update', verifyToken, JobsController.updateJob);
endpoints.get('/jobs/list', verifyToken, JobsController.getJobs);
endpoints.get('/getAllJobs', verifyToken, JobsController.getAllJobs);
endpoints.get('/getJob/:id', verifyToken, JobsController.getJob);


endpoints.patch('/jobs/updateState', verifyToken, JobsController.updateJobState);

// Job Applications endpoints
endpoints.post('/applyForJob', verifyToken, JobApplications.applyForJob);
endpoints.get('/jobApplications', verifyToken, JobApplications.jobApplications);
endpoints.get('/myApplications', verifyToken, JobApplications.myApplications);

// BookMark endpoints
endpoints.post('/createBookMark', verifyToken, BookMarkController.createBookMark);
endpoints.post('/getBookMarks', verifyToken, BookMarkController.getBookMarks);

endpoints.get('/meEndpoint', verifyToken, (req, res) => {
    return res.send('Ok');
});

module.exports = endpoints;