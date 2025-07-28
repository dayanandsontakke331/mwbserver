const jwt = require('jsonwebtoken');

exports.generateTokens = function (user) {
    const payload = {
        _id: user._id,
        email: user.email,
        role: user.role
    };

    const accessToken = jwt.sign(payload, "!@#2W^eR*()_+gFd$x=54^%", { expiresIn: '1d' });
    const refreshToken = jwt.sign(payload, "Y#uR^R3fr3$hT0k3n*SeCR3T!=", { expiresIn: '2m' });

    const userObj = user.toObject();
    delete userObj.password;

    return {
        message: "Login successful",
        success: true,
        data: {
            user: userObj,
            accessToken,
            refreshToken
        }
    };
};

exports.verifyRefreshToken = function (token) {
    return jwt.verify(token, "Y#uR^R3fr3$hT0k3n*SeCR3T!=");
};