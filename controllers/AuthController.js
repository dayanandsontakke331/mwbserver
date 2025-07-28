const bcrypt = require('bcrypt');
const User = require('../models/User');
const { generateTokens, verifyRefreshToken } = require('../services/AuthService');
const custom = require('../config/custom');


exports.register = async (req, res) => {
    try {
        if (req.body.password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters',
                data: null
            });
        }

        const totalUsers = await User.countDocuments({});

        if (totalUsers === 0) {
            // first registration role setting admin
            req.body.role = custom.roles.admin;
        } else {
            if (req.body.role === custom.roles.admin) {
                return res.status(403).json({
                    success: false,
                    message: 'Admin registration is not allowed',
                    data: null
                });
            }
        }

        const adminConflict = await User.findOne({
            role: custom.roles.admin,
            $or: [
                { email: req.body.email },
                { phone: req.body.phone }
            ]
        });

        if (adminConflict) {
            return res.status(400).json({
                success: false,
                message: 'Email or phone already registered as admin',
                data: null
            });
        }

        const existingUser = await User.findOne({
            role: req.body.role,
            $or: [
                { email: req.body.email },
                { phone: req.body.phone }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email or phone already registered for this role',
                data: null
            });
        }

        const newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phone: req.body.phone,
            email: req.body.email,
            role: req.body.role,
            password: req.body.password
        });

        await newUser.save();

        return res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                _id: newUser._id,
                name: newUser.firstName + ' ' + newUser.lastName,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role
            }
        });
    } catch (err) {
        console.log("Registration error", err);
        return res.status(500).json({
            success: false,
            message: `Something went wrong`,
            data: null
        });
    }
};

exports.login = async (req, res) => {
    const { username, password, loginAs } = req.body;

    if (!username) {
        return res.json({ message: "Phone or email is required", success: false, data: null });
    }

    if (!password) {
        return res.json({ message: "Password is required", success: false, data: null });
    }

    let user;

    const admin = await User.findOne({
        role: 'admin',
        $or: [{ phone: username }, { email: username }]
    });

    if (admin) {
        user = admin;
    } else if (loginAs) {
        user = await User.findOne({
            role: loginAs,
            $or: [{ phone: username }, { email: username }]
        });
    }

    if (!user || !user.password) {
        return res.json({ message: "Invalid username or password", success: false, data: null });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return res.json({ message: "Invalid username or password", success: false, data: null });
    }

    return res.json(generateTokens(user));
};


exports.refreshToken = async (req, res) => {
    console.log("refresh call", req.body.refreshToken);

    if (!req.body.refreshToken) {
        return res.json({ message: "Unauthorized Request", success: false, data: null });
    }

    let decoded;
    try {
        decoded = verifyRefreshToken(req.body.refreshToken);
    } catch (err) {

        return res.status(401).json({ message: "Unauthorized Request", success: false, data: null });
    }

    const user = await User.findById(decoded._id);
    console.log("user", user);

    if (!user) {
        console.log("refresh token user not found")
        return res.status(401).json({ message: "Unauthorized Request", success: false, data: null });
    }

    return res.json(generateTokens(user));
};


// const RedisService = require('./services/RedisService');

// (async () => {
//   await RedisService.set('session:user:123', 'some-session-token', { ttl: 60 });

//   const token = await RedisService.get('session:user:123');
//   console.log('Token:', token);

//   await RedisService.expire('session:user:123', 30);
// })();