const express = require('express');
const UserSchema = require('../../models/UserSchema');
const NotificationSchema = require('../../models/NotificationSchema');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const upload = multer({dest: 'uploads/'});

const router = express.Router();

// get searched users

router.get('/', async (req, res, next) => {

    let queryObj = req.query;

    if(queryObj.username) {
        const string = queryObj.username;

        queryObj = {$or: [{username: {$regex: string, $options: "i"}}, {firstName: {$regex: string, $options: "i"}}, {lastName: {$regex: string, $options: "i"}}]}
        
    }

    const users = await UserSchema.find(queryObj)
        .catch(err => res.sendStatus(500))


    res.status(200).send(users)
});


// handle follow logic

router.put('/:userId/follow', async (req, res, next) => {
    const userId = req.params.userId;

    const user = await UserSchema.findById(userId);

    if(!user) return res.sendStatus(404);

    const alreadyFollowing = user.followers && user.followers.includes(req.session.user._id);

    if(!alreadyFollowing) {
        // Create a new notification
        NotificationSchema.insertNotification(userId, req.session.user._id, "follow", req.session.user._id)
    }

    const option = alreadyFollowing ? '$pull' : '$addToSet';

    await UserSchema.findByIdAndUpdate(userId, {[option]: {followers: req.session.user._id}}, {new: true})
    req.session.user = await UserSchema.findByIdAndUpdate(req.session.user._id, {[option]: {followings: userId}}, {new: true})


    res.status(200).send(req.session.user)
})

// fetch either followers or followings

router.get('/:userId', async (req, res, next) => {
    const userId = req.params.userId;

    const select = req.query.data == 'followers' ? 'followers' : 'followings';

    let user = await UserSchema.findById(userId);

    if(select === 'followers') {
        user = await UserSchema.populate(user, {path: 'followers'})
        console.log(user)
    } else {
        user = await UserSchema.populate(user, {path: 'followings'})
    }

    res.status(200).send(user)
});

// Upload profile picture

router.put('/image', upload.single("croppedImage"), (req, res, next) => {

    if(!req.file) {
        return res.sendStatus(400);
    }
    
    const filePath = `uploads/images/${req.file.filename}.png`
    const tempPath = req.file.path;
    const targetPath = path.join(__dirname, `../../${filePath}`)

    fs.rename(tempPath, targetPath, async err => {

        if(req.session.user.profilePic !== '/images/profilePic.png') {
            const removePath = `${req.session.user.profilePic}`;

            fs.unlink(path.join(__dirname, `../../uploads/${removePath}`), (err) => {
                if(err) {
                    console.log(err)
                }

                console.log('removed')
            })
        }

        req.session.user = await UserSchema.findByIdAndUpdate(req.session.user._id, {profilePic: `/images/${req.file.filename}.png`}, {new: true})

        res.sendStatus(204)
    })

})

// upload cover photo

router.put('/cover', upload.single('croppedCoverImage'), (req, res, next) => {
    
    if(!req.file) {
        return res.sendStatus(400);
    }

    const tempPath = req.file.path;
    const filePath = `uploads/covers/${req.file.filename}.png`;
    const targetPath = path.join(__dirname, `../../${filePath}`);

    fs.rename(tempPath, targetPath, async (err) => {
        if(err != null) {
            res.sendStatus(400)
        }

        if(req.session.user.coverPic) {
            fs.unlink(path.join(__dirname, `../../uploads${req.session.user.coverPic}`), err => {
                if(err) {
                    console.log(err)
                }
            })
        }

        req.session.user = await UserSchema.findByIdAndUpdate(req.session.user._id, {coverPic: `/covers/${req.file.filename}.png`}, {new: true})
    
        res.sendStatus(204)
    })
})

module.exports = router;