const express = require('express');
const NotificationSchema = require('../../models/NotificationSchema');

const router = express.Router();

// Get all notification for a user

router.get('/', (req, res, next) => {

    const queryObj = {userTo: req.session.user._id, notificationType: {$ne: "newMessage"}};

    if(req.query.badgesOnly && req.query.badgesOnly == "true") {
        queryObj.opened = false
    }
    
    NotificationSchema.find(queryObj)
        .populate('userTo')
        .populate('userFrom')
        .sort({"opened": false})
        .then(results => res.status(200).send(results))
        .catch(err => console.log(err))
});


// Get the latest notification

router.get('/latest', (req, res ,next) => {
    NotificationSchema.findOne({userTo: req.session.user._id})
        .populate('userTo')
        .populate('userFrom')
        .sort({ createdAt: -1 })
        .then(result => {
            res.status(200).send(result)
        })
})

// update a single notification's opened property

router.put('/:id', (req, res, next) => {
    NotificationSchema.findByIdAndUpdate(req.params.id, {opened: true})
        .catch(err => console.log(err))

    res.sendStatus(204)
});

// update all user's notifications opened property

router.put('/', (req ,res, next) => {
    NotificationSchema.updateMany({userTo: req.session.user._id}, {opened: true})
        .then(() => res.sendStatus(201))
        .catch(err => console.log(err))
});




module.exports = router;