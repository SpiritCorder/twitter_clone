const express = require('express');

const router = express.Router();

router.get('/:id', (req, res, next) => {
    const payload = {
        title: "View Post",
        loggedInUser: req.session.user,
        loggedInUserJs: JSON.stringify(req.session.user),
        postId: req.params.id
    };

    res.render("postPage", payload)
});



module.exports = router;