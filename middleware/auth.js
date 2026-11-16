const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { t } = require('../utils/i18n');

//Protect routes
exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    //Make sure token exists
    if (!token || token == 'null') {
        return res.status(401).json({ success: false, message: t(req, 'auth.notAuthorized') });
    }

    try {
        //Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id);

        //User may have been deleted after the token was issued
        if (!req.user) {
            return res.status(401).json({ success: false, message: t(req, 'auth.notAuthorized') });
        }

        next();
    } catch (err) {
        console.log(err.stack);
        return res.status(401).json({ success: false, message: t(req, 'auth.notAuthorized') });
    }
};

//Grant access to specific roles
exports.authorize=(...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return res.status(403).json({
                success:false,
                message:t(req, 'auth.roleNotAuthorized', { role: req.user.role })
            });
        }
        next();
    }
}
