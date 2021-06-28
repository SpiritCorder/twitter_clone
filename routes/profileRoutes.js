const express = require('express');
const UserSchema = require('../models/UserSchema');

const router = express.Router();

router.get('/', (req, res, next) => {
    const payload = {
        title: `${req.session.user.username} Profile`,
        loggedInUser: req.session.user,
        loggedInUserJs: JSON.stringify(req.session.user),
        profileUser: req.session.user
    };

    res.render('profilePage', payload)
});

router.get('/:username', async (req, res, next) => {

    const payload = await getUser(req.params.username, req.session.user)

    res.render('profilePage', payload)
});

router.get('/:username/replies', async (req ,res , next) => {

    const payload = await getUser(req.params.username, req.session.user)
    payload.selectedTab = 'replies';

    res.render('profilePage', payload)
});

router.get('/:username/followers', async (req, res ,next) => {

    const payload = await getUser(req.params.username, req.session.user);

    payload.selectedTab = 'followers';

    res.render('followersAndFollowings', payload);
});

router.get('/:username/followings', async (req, res ,next) => {

    const payload = await getUser(req.params.username, req.session.user);

    payload.selectedTab = 'followings';

    res.render('followersAndFollowings', payload);
});

async function getUser(username, loggedInUser) {
    let user = await UserSchema.findOne({username})

    if(!user) {
        user = await UserSchema.findById(username)

        if(!user) {
            return {
                title: 'User Not Found',
                loggedInUser,
                loggedInUserJs: JSON.stringify(loggedInUser)
            }
        }
    }

    return {
        title: user.username,
        loggedInUser,
        loggedInUserJs: JSON.stringify(loggedInUser),
        profileUser: user
    }
}


module.exports = router;