const express = require('express');
const ChatSchema = require('../../models/ChatSchema');
const UserSchema = require('../../models/UserSchema');
const MessageSchema = require('../../models/MessageSchema');

const router = express.Router();


// get messages for a chat

router.get('/:id/messages', (req, res, next) => {
    MessageSchema.find({chat: req.params.id})
        .populate('sender')
        .then(results => res.status(200).send(results))
        .catch(err => console.log(err))
});

// get chat data for a user
router.get('/', (req, res, next) => {

    ChatSchema.find({users: {$elemMatch: {$eq: req.session.user._id}}})
        .populate('users', ['firstName' ,'lastName', 'profilePic'])
        .populate('latestMessage')
        .sort({"updatedAt": -1})
        .then(async results => {

            if(req.query.badgesOnly && req.query.badgesOnly == "true") {
                
                results = results.filter(r => {
                    if(r.latestMessage) {
                        return r.latestMessage.sender != req.session.user._id && !r.latestMessage.readBy.includes(req.session.user._id)
                    }
                })

                return res.status(200).send(results)
            }


            results = await UserSchema.populate(results, {path: 'latestMessage.sender'})

            res.status(200).send(results)
        })
        .catch(err => console.log(err))
});


// Get chat name
router.get('/:id', (req, res , next) => {
    ChatSchema.findOne({_id: req.params.id, users: {$elemMatch: {$eq: req.session.user._id}}})
        .populate('users')
        .then(chat => res.status(200).send(chat))
        .catch(err => console.log(err))
});


// Create a chat

router.post('/', (req, res , next) => {
    
    if(!req.body.users) return res.sendStatus(400);

    const users = req.body.users;

    users.push(req.session.user);

    const chatData = {
        isGroupChat: true,
        users
    };

    ChatSchema.create(chatData)
        .then(result => res.status(201).send(result))
        .catch(err => console.log(err))

    
});


// change chat name

router.put('/:id', (req, res, next) => {
    console.log(req.body)

    ChatSchema.findByIdAndUpdate(req.params.id, {chatName: req.body.chatName}, {new: true})
        .then(chat => res.sendStatus(204))
        .catch(err => console.log(err))
});

// Update all messages as read

router.put('/:id/messages/markAsRead', async (req ,res ,next) => {
    await MessageSchema.updateMany({chat: req.params.id, sender: {$ne: req.session.user._id}}, {$addToSet: {readBy: req.session.user._id}})

    res.sendStatus(204)
})


module.exports = router