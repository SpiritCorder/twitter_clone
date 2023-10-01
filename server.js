const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const morgan = require('morgan');
const helmet = require('helmet');
const dotenv = require('dotenv');
const compression = require('compression');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI, { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
    })
    .then(conn => {
        console.log("Connected to the database")
    })
    .catch(err => {
        console.log("Database connection error " + err)
    })

const app = express();

const {auth} = require('./middleware');

// Routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/postRoutes');
const profileRoutes = require('./routes/profileRoutes');
const searchRoutes = require('./routes/searchRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');


// Api Routes
const posts = require('./routes/api/posts');
const users = require('./routes/api/users');
const chats = require('./routes/api/chats');
const messages = require('./routes/api/messages');
const notifications = require('./routes/api/notifications');


// Setting The View Engine
app.set("view engine", "pug");
app.set("views", "views");

// Serving static files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, 'uploads')));

// Body parser middleware
app.use(express.urlencoded({extended: false}));
app.use(express.json());

// secure http headers with helmet
app.use(helmet());
app.use(compression());

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'})

app.use(morgan("common", {stream: accessLogStream}));

app.use((req, res ,next) => {
    res.set("Content-Security-Policy", "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'; img-src * data:");
    next();
})

app.use(session({
    secret: 'spiritRS',
    resave: true,
    saveUninitialized: false
}));

// Routes
app.use("/auth", authRoutes);
app.use('/posts', auth, postRoutes);
app.use('/profile', auth, profileRoutes);
app.use('/search', auth, searchRoutes);
app.use('/messages', auth, messageRoutes);
app.use('/notifications', auth, notificationRoutes);

// Api Routes 
app.use('/api/posts', auth, posts);
app.use('/api/users', auth, users);
app.use('/api/chats', auth, chats);
app.use('/api/messages', auth, messages);
app.use('/api/notifications', auth, notifications);


app.get("/", auth, (req, res, next) => {

    const payload = {
        title: "Home",
        loggedInUser: req.session.user,
        loggedInUserJs: JSON.stringify(req.session.user)
    };

    res.render("home", payload);
});


const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));

const io = require('socket.io')(server, {pingTimeout: 60000})

io.on("connection", socket => {

    console.log('A new web socket connected...')

    socket.on('setUp', userData => {
        socket.join(userData._id)
        socket.emit("connected")
    })

    socket.on('join room', room => socket.join(room))
    socket.on('typing', room => {

        socket.in(room).emit('typing')
    })
    socket.on('stop typing', room => socket.in(room).emit('stop typing'))
    
    
    socket.on('new message', message => {

        console.log("New message has received... " + message);

        if(!message.chat.users) return console.log('no users data')

        socket.to(message.chat._id).emit('message received', message);

        // message.chat.users.forEach(obj => {
        //     if(obj._id == message.sender._id) return;

        //     console.log(obj._id, " " , message.sender._id);

        //     socket.to(obj._id).emit('message received', message)
        // })
    })

    socket.on("notification received", userId => {
        socket.in(userId).emit("notification received")
    })

})