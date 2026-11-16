const { t } = require('./i18n');

//Send an error response with a translated message
//- Mongoose validation error  -> 400 (messages in models are i18n keys)
//- Duplicate key (e.g. email)  -> 400
//- Invalid ObjectId            -> 400
//- Others                      -> 500 with fallbackKey
const handleError = (err, req, res, fallbackKey) => {
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors)
            .map(e => t(req, e.message))
            .join(', ');
        return res.status(400).json({ success: false, message });
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {}).join(', ');
        return res.status(400).json({ success: false, message: t(req, 'error.duplicate', { field }) });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({ success: false, message: t(req, 'error.invalidId', { value: err.value }) });
    }

    return res.status(500).json({ success: false, message: t(req, fallbackKey) });
};

module.exports = handleError;
