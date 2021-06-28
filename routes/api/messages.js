const express = require('express');
const MessageSchema = require('../../models/MessageSchema');
const ChatSchema = require('../../models/ChatSchema');
const NotificationSchema = require('../../models/NotificationSchema');
const UserSchema = require('../../models/UserSchema');

const router = express.Router();



router.post('/', (req, res ,next) => {

    const message = {...req.body};

    message.sender = req.session.user._id;

    MessageSchema.create(message)
        .then(async result => {
            result = await result.populate('sender').execPopulate()
            result = await result.populate('chat').execPopulate()
            
            result = await UserSchema.populate(result, {path: 'chat.users'})
          
            res.status(201).send(result)

            const chat = await ChatSchema.findByIdAndUpdate(req.body.chat, {latestMessage: result._id});

            if(chat.users) {
                chat.users.forEach(userId => {
                    if(userId == result.sender._id) return;

                    NotificationSchema.insertNotification(userId, result.sender._id, "newMessage", chat._id)  
                })
            }

           
        })
        .catch(err => console.log(err))
});


module.exports = router;