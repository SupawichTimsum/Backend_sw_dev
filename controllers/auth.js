const User = require('../models/User');
const { t } = require('../utils/i18n');
const handleError = require('../utils/errorResponse');

//@desc     Register user
//@route    POST /api/v1/auth/register
//@access   Public
exports.register = async (req, res, next) => {
    try {
        const { name, tel, email, password, role, language } = req.body;

        // Create user
        const user = await User.create({
            name,
            tel,
            email,
            password,
            role,
            language
        });

        // Create token
        sendTokenResponse(user, 201, res);

    } catch (err) {
        console.log(err.stack);
        return handleError(err, req, res, 'auth.registerFailed');
    }
};

//@desc     Login user
//@route    POST /api/v1/auth/login
//@access   Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({ success: false, message: t(req, 'auth.provideEmailPassword') });
        }

        // Check for user
        const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, message: t(req, 'auth.invalidCredentials') });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: t(req, 'auth.invalidCredentials') });
        }

        // Create token
        sendTokenResponse(user, 200, res);
    } catch (err) {
        console.log(err.stack);
        return res.status(401).json({ success: false, message: t(req, 'auth.invalidCredentials') });
    }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token
    });
};

//@desc     Log user out / clear cookie
//@route    GET /api/v1/auth/logout
//@access   Private
exports.logout = async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: t(req, 'auth.loggedOut'),
        data: {}
    });
};

//@desc     Get current Logged in user (view profile)
//@route    GET /api/v1/auth/me
//@access   Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        console.log(err.stack);
        return handleError(err, req, res, 'auth.updateProfileFailed');
    }
};

//@desc     Update profile (name, tel, email, language)
//@route    PUT /api/v1/auth/updatedetails
//@access   Private
exports.updateDetails = async (req, res, next) => {
    try {
        //Only allow these fields (password and role can not be changed here)
        const fieldsToUpdate = {};
        ['name', 'tel', 'email', 'language'].forEach(field => {
            if (req.body[field] !== undefined) {
                fieldsToUpdate[field] = req.body[field];
            }
        });

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            returnDocument: 'after',
            runValidators: true
        });

        //Reply in the new language if it was changed
        req.user = user;

        res.status(200).json({
            success: true,
            message: t(req, 'auth.profileUpdated'),
            data: user
        });
    } catch (err) {
        console.log(err.stack);
        return handleError(err, req, res, 'auth.updateProfileFailed');
    }
};

//@desc     Update password
//@route    PUT /api/v1/auth/updatepassword
//@access   Private
exports.updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: t(req, 'auth.provideCurrentNewPassword') });
        }

        const user = await User.findById(req.user.id).select('+password');

        // Check current password
        if (!(await user.matchPassword(currentPassword))) {
            return res.status(401).json({ success: false, message: t(req, 'auth.currentPasswordIncorrect') });
        }

        user.password = newPassword;
        await user.save();

        //Send a new token
        sendTokenResponse(user, 200, res);
    } catch (err) {
        console.log(err.stack);
        return handleError(err, req, res, 'auth.updatePasswordFailed');
    }
};
