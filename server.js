const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { startNotificationScheduler } = require('./utils/notificationScheduler');

//Load env vars
dotenv.config({path:'./config/config.env'});

connectDB();

//Route files
const massageShops = require('./routes/massageShops');
const auth = require('./routes/auth');
const reservations = require('./routes/reservations');
const reviews = require('./routes/reviews');
const favorites = require('./routes/favorites');
const notifications = require('./routes/notifications');

const app=express();

app.set('query parser','extended');

//Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

//Mount routers
app.use('/api/v1/massageshops',massageShops);
app.use('/api/v1/auth', auth);
app.use('/api/v1/reservations', reservations);
app.use('/api/v1/reviews', reviews);
app.use('/api/v1/favorites', favorites);
app.use('/api/v1/notifications', notifications);

const PORT=process.env.PORT || 5000;

const server = app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, ' mode on port ', PORT));

//Reminder before reservations (in-app notification)
startNotificationScheduler();

//Handle unhandled promise rejections
process.on('unhandledRejection',(err,promise)=>{
    console.log(`Error: ${err.message}`);
    //Close server & exit process
    server.close(()=>process.exit(1));
})
