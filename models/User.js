const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'validation.user.nameRequired'],
        trim: true
    },
    tel: {
        type: String,
        required: [true, 'validation.user.telRequired'],
        match: [/^0[0-9]{8,9}$/, 'validation.user.telInvalid']
    },
    email: {
        type: String,
        required: [true, 'validation.user.emailRequired'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'validation.user.emailInvalid'
        ]
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'validation.user.passwordRequired'],
        minlength: [6, 'validation.user.passwordMin'],
        select: false
    },
    //Display language of API messages
    language: {
        type: String,
        enum: { values: ['th', 'en'], message: 'validation.user.languageEnum' },
        default: 'en'
    },
    //Favorite massage shops for quick access
    favorites: [{
        type: mongoose.Schema.ObjectId,
        ref: 'MassageShop'
    }],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password using bcrypt (only when password is new/changed)
UserSchema.pre('save', async function() {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
