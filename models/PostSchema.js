const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
    content: {
        type: String
    },
    postedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    pinned: {
        type: Boolean,
        default: false
    },
    likes: [{type: Schema.Types.ObjectId, ref: 'User'}],
    retweetUsers: [{type: Schema.Types.ObjectId, ref: 'User'}],
    retweetData: {type: Schema.Types.ObjectId, ref: 'Post'},
    replyTo: {type: Schema.Types.ObjectId, ref: 'Post'}
}, {
    timestamps: true
});

module.exports = mongoose.model("Post", PostSchema);