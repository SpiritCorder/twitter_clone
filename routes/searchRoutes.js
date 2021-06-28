const express = require('express');

const router = express.Router();

router.get('/', (req, res, next) => {

    const payload = getPayload(req.session.user);

    res.render('search', payload);

});

router.get('/:selectedTab', (req, res, next) => {

    const payload = getPayload(req.session.user);

    payload.selectedTab = req.params.selectedTab;

    res.render('search', payload)

});

function getPayload(user) {
    return {
        title: 'Search',
        loggedInUser: user,
        loggedInUserJs: JSON.stringify(user)
    }
}


module.exports = router;