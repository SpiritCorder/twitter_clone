const express = require('express');
const PostSchema = require('../../models/PostSchema');
const UserSchema = require('../../models/UserSchema');
const NotificationSchema = require('../../models/NotificationSchema');

const router = express.Router();

// Retrive single post
router.get('/:id', async (req, res, next) => {
    const postId = req.params.id;

    let result = {};
    const post = await getPosts({_id: postId})

    result.post = post[0]

    if(result.post.replyTo) {
        result.replyTo = result.post.replyTo
    }

    result.replies = await getPosts({replyTo: postId})

    res.status(200).send(result);
});

// Retrive all posts
router.get('/', async (req, res, next) => {

    const queryObj = req.query ? req.query : {};

    if(queryObj.content) {
        queryObj.content = {$regex: queryObj.content, $options: "i"}
    }

    if(queryObj.isPinned) {
        queryObj.pinned = true;

        delete queryObj.isPinned
    }

    if(queryObj.isReply) {
        if(queryObj.isReply == "false") {
            queryObj.replyTo = {$exists: false}
        } else {
            queryObj.replyTo = {$exists: true}
        }

        delete queryObj.isReply;
    }

    if(queryObj.followingOnly) {
        
        const followingIds = [];

        if(req.session.user.followings.length > 0) {
            req.session.user.followings.forEach(userId => {
                followingIds.push(userId)
            });

            followingIds.push(req.session.user._id)
        } else {
            followingIds.push(req.session.user._id)
        }

        queryObj.postedBy = {$in: followingIds}

        delete queryObj.followingOnly
    }



    const posts = await getPosts(queryObj);
    res.status(200).send(posts);
});

// Create a post instance
router.post('/', (req, res, next) => {

    const postData = {
        postedBy: req.session.user
    };

    if(req.body.content) {
        postData.content = req.body.content;
    } else {
        postData.content = req.body.reply;
        postData.replyTo = req.body.postId;
    }

    PostSchema.create(postData)
        .then( async newPost => {
            newPost = await PostSchema.populate(newPost, {path: "replyTo"})
            newPost = await UserSchema.populate(newPost, {path: "replyTo.postedBy"})

            return UserSchema.populate(newPost, {path: "postedBy"})
            
        })
        .then(populatedPost => {
            if(req.body.reply) {
                if(populatedPost.replyTo.postedBy._id != req.session.user._id) {
                    // send notification for reply
                    NotificationSchema.insertNotification(populatedPost.replyTo.postedBy._id, req.session.user._id, "reply", populatedPost._id)
                }
            }

            res.status(201).send(populatedPost)
        })
        .catch(err => {
            console.log(err);
            res.sendStatus(400);
        })
});

// Add likes to a post

router.put('/:id/like', async (req, res, next) => {
    const postId = req.params.id;
    const userId = req.session.user._id;
    
    const isLiked = req.session.user.likes && req.session.user.likes.includes(postId);

    const option = isLiked ? "$pull" : "$addToSet";

    req.session.user = await UserSchema.findByIdAndUpdate(userId, {[option]: {likes: postId}}, {new: true});
    const post = await PostSchema.findByIdAndUpdate(postId, {[option]: {likes: userId}}, {new: true});

    if(!isLiked) {
        // send notification for like
        
        if(post.postedBy != userId) {
            NotificationSchema.insertNotification(post.postedBy, req.session.user._id, "like", postId)
        }
    }


    res.status(200).send(post);
});

// Retweet Post

router.post('/:id/retweet', async (req, res, next) => {
    const postId = req.params.id;
    const userId = req.session.user._id;

    const deletedPost = await PostSchema.findOneAndDelete({postedBy: userId, retweetData: postId });

    const option = deletedPost ? "$pull" : "$addToSet";

    let retweet = deletedPost;

    if(!deletedPost) {
        retweet = await PostSchema.create({
            postedBy: userId,
            retweetData: postId
        })
    } 

    req.session.user = await UserSchema.findByIdAndUpdate(userId, {[option]: {retweets: retweet._id}}, {new: true});
    const post = await PostSchema.findByIdAndUpdate(postId, {[option]: {retweetUsers: userId }}, {new: true});

    if(!deletedPost) {
        if(post.postedBy != userId) {
            // create a notification for a retweet
            NotificationSchema.insertNotification(post.postedBy, userId, "retweet", post._id)
        }
    }

    res.status(200).send(post);
});

// Delete a post

router.delete('/:id', (req, res ,next) => {
    const postId = req.params.id;
    
    PostSchema.findByIdAndDelete(postId)
        .then(result => {
            res.sendStatus(202)
        })
        .catch(err => console.log(err))

});

// Pin a post

router.get('/:id/pinned', async (req, res, next) => {
    const postId = req.params.id;

    const alreadyPinned = await PostSchema.find({postedBy: req.session.user._id, pinned: true});

    if(alreadyPinned.length > 1) {
        return res.sendStatus(400)
    }

    if(alreadyPinned.length == 0) {
        await PostSchema.findOneAndUpdate({$and: [{_id: postId}, {postedBy: req.session.user._id}]}, {pinned: true}, {new: true});

        return res.sendStatus(204)
    } else {
        if(alreadyPinned[0]._id == postId) {
            await PostSchema.findByIdAndUpdate(postId,  {pinned: false}, {new: true})
            
            return res.sendStatus(204)
        } else {
            await PostSchema.findByIdAndUpdate(postId,  {pinned: true}, {new: true})
            await PostSchema.findByIdAndUpdate(alreadyPinned[0]._id, {pinned: false})

            return res.sendStatus(204)
        }


    }


})



async function getPosts(filter) {
    let results = await PostSchema.find(filter)
        .populate('postedBy', ['firstName', 'lastName', 'username', 'profilePic'])
        .populate('retweetData')
        .populate('replyTo')
        .sort({"createdAt": -1})
        .catch(err => console.log(err))

        result = await UserSchema.populate(results, {path: "replyTo.postedBy"})

    return await UserSchema.populate(results, {path: "retweetData.postedBy"});
}

module.exports = router;