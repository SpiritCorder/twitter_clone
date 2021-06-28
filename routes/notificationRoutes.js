const express = require('express');
const router = express.Router();

router.get('/', (req, res ,next) => {

    const payload = {
        title: 'Notifications',
        loggedInIser: req.session.user,
        loggedInUserJs: JSON.stringify(req.session.user)
    }

    res.render('notification', payload)
})


module.exports = router;