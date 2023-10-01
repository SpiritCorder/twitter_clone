const express = require('express');
const ChatSchema = require('../models/ChatSchema');
const UserSchema = require('../models/UserSchema');
const mongoose = require('mongoose');

const router = express.Router();

router.get('/', (req, res, next) => {
    const payload = {
        title: 'Inbox',
        loggedInUser: req.session.user,
        loggedInUserJs: JSON.stringify(req.session.user)
    };

    res.render('inbox', payload);
});

router.get('/new', (req, res ,next) => {
    const payload = {
        title: 'New Chat',
        loggedInUser: req.session.user,
        loggedInUserJs: JSON.stringify(req.session.user)
    };

    res.render('newChats', payload)
});

router.get('/:id', async (req, res, next) => {

    const chatId = req.params.id;
    const userId = req.session.user._id;

    

    let chat = await ChatSchema.findOne({_id: chatId, users: {$elemMatch: {$eq: userId}}});

    chat = await UserSchema.populate(chat, {path: 'users'})

    if(!chat) {
        const user = await UserSchema.findById(chatId);

        if(user) {
            chat = await getChatByUserId(userId, chatId )
        }

    }

    const payload = {
        title: "Chat",
        loggedInUser: req.session.user,
        loggedInUserJs: JSON.stringify(req.session.user),
        chat: chat
    };

    res.render('chatPage', payload);
});

async function getChatByUserId(loggedInUserId, profileUserId) {
  
    return await ChatSchema.findOneAndUpdate({
        isGroupChat: false,
        users: {
            $size: 2,
            $all: [
                {$elemMatch: {$eq: mongoose.Types.ObjectId(loggedInUserId)}},
                {$elemMatch: {$eq: mongoose.Types.ObjectId(profileUserId)}}
            ]
        }

    }, {
        $setOnInsert: {
            users: [loggedInUserId, profileUserId]
        }
    }, {
        new: true,
        upsert: true
    }).populate("users")
    
}


module.exports = router;
