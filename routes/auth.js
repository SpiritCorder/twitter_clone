const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');

const UserSchema = require('../models/UserSchema');

app.set("view engine", "pug");
app.set("views", "views");

const router = express.Router();

/******  Login Routes  *******/ 

router.get("/login", (req, res, next) => {
    res.render("login")
});

router.post("/login", async (req, res, next) => {
    const {logUsername, logPassword} = req.body;

    const payload = {
        username: logUsername
    };

    try {
        const user = await UserSchema.findOne({$or: [{username: logUsername}, {email: logUsername}]});

        if(!user) {
            payload.errorMessage = "Invalid username or email";
            return res.render("login", payload);
        }

        const isMatch = await bcrypt.compare(logPassword, user.password);

        if(!isMatch) {
            payload.errorMessage = "Password does not match";
            return res.render("login", payload);
        }

        user.password = null;
        req.session.user = user;
        res.redirect('/');

    } catch(err) {
        console.log(err);
    } 
});

/******  Register Routes  *******/ 

router.get("/register", (req, res, next) => {
    res.render("register");
});

router.post("/register", async (req, res, next) => {

    const firstName = req.body.firstName.trim();
    const lastName = req.body.lastName.trim();
    const username = req.body.username.trim();
    const email = req.body.email.trim();
    const password = req.body.password;

    const payload = {
        firstName,
        lastName,
        username,
        email,
        password
    };

    try {

        if(firstName && lastName && username && email && password) {
            const user = await UserSchema.findOne({$or: [{username}, {email}]});
            
            if(user) {
                if(user.email === email) {
                    payload.errorMessage= "Email already exists";
                } else {
                    payload.errorMessage = "Username already exists";
                }

                return res.render("register", payload);
                
            }

            const data = req.body;

            const salt = await bcrypt.genSalt(10);

            const hash = await bcrypt.hash(password, salt);

            data.password = hash;

            const newUser = await UserSchema.create(data);

            newUser.password = null;

            req.session.user = newUser;

            return res.redirect('/');

        } else {
            payload.errorMessage = "Make sure all fields are filled correctly";
            res.render("register", payload);
        }
    } catch(err) {
        console.log(err)
    }
});

/******  Logout Route  *******/ 

router.get("/logout", (req, res, next) => {
    if(req.session) {
        req.session.destroy(() => {
            return res.redirect('/auth/login');
        })
    }
});

module.exports = router;