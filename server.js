const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const config = require('./_config');

// Define routes
let index = require('./routes/index');
let image = require('./routes/image');

// Initializing the app
const app = express();

// Masking sensitive data in error messages
function sanitizeError(error) {
    if (typeof error === 'string') {
        // Replace any MongoDB URI patterns with masked version
        return error.replace(
            /mongodb(\+srv)?:\/\/[^:]+:[^@]+@[^/]+/g,
            'mongodb://***:***@***'
        );
    }
    return error;
}

// Sanitizing deprecation warnings to prevent credentials exposure
const originalEmitWarning = process.emitWarning;
process.emitWarning = function(warning, type, code, ctor) {
    // Sanitizing MongoDB URL deprecation warnings that expose credentials
    if (code === 'DEP0170' && warning.includes('mongodb://')) {
        const sanitizedWarning = sanitizeError(warning);
        return originalEmitWarning.call(process, sanitizedWarning, type, code, ctor);
    }
    return originalEmitWarning.call(process, warning, type, code, ctor);
};

// Override console methods to sanitize MongoDB URIs
const originalConsoleError = console.error;
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;

console.error = function(...args) {
    const sanitizedArgs = args.map(arg => sanitizeError(arg));
    originalConsoleError.apply(console, sanitizedArgs);
};

console.log = function(...args) {
    const sanitizedArgs = args.map(arg => sanitizeError(arg));
    originalConsoleLog.apply(console, sanitizedArgs);
};

console.warn = function(...args) {
    const sanitizedArgs = args.map(arg => sanitizeError(arg));
    originalConsoleWarn.apply(console, sanitizedArgs);
};

// Helper function to safely log database connection
function getSecureLogMessage(uri) {
    if (!uri) return 'Database URI not found';
    
    // Extract just the database name for logging
    const dbMatch = uri.match(/\/([^/?]+)(?:\?|$)/);
    const dbName = dbMatch ? dbMatch[1] : 'unknown';
    const env = process.env.NODE_ENV || 'development';
    
    return `Connected to Database: ${env} environment (${dbName})`;
}

// connecting the database
const MONGODB_URI = process.env.MONGODB_URI || config.mongoURI[app.settings.env]
mongoose.connect(MONGODB_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true  
},(err)=>{
    if (err) {
        // Enhanced error handling
        console.log(sanitizeError(err.message || err))
    }else{
        console.log(getSecureLogMessage(MONGODB_URI))
    }
});

// test if the database has connected successfully
// let db = mongoose.connection;
// db.once('open', ()=>{
//     console.log('Database connected successfully')
// })




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


module.exports = app;