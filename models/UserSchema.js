const mongoose = require('mongoose');

const schema = mongoose.Schema;

const UserSchema = new schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    profilePic: {
        type: String,
        default: "/images/profilePic.png"
    },
    coverPic: String,
    likes: [{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}],
    retweets: [{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}],
    followings: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    followers: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]

}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);