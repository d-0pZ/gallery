const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

//importing config for MongoDB Atlas
const config = require('./_config');

// Define routes
let index = require('./routes/index');
let image = require('./routes/image');

//getting environment(dev,prod or test)
const environment = process.env.NODE_ENV || 'development';

// connect to MongoDB Atlas
mongoose.connect(config.mongoURI[environment], {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err) => {
    if (err) console.log(err);
});

// test if the database has connected successfully
let db = mongoose.connection;
db.once('open', ()=>{
    console.log('Database connected successfully')
})

// Initializing the app
const app = express();


// View Engine
app.set('view engine', 'ejs');

// Set up the public folder;
app.use(express.static(path.join(__dirname, 'public')));

// body parser middleware
app.use(express.json());
app.use('/', index);
app.use('/image', image);

// fixed port configuration for Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () =>{
    console.log(`Server is listening at http://localhost:${PORT}`);
});