var config = {}

//MongoDB Atlas connection strings
config.mongoURI = {
    production: process.env.MONGODB_URI_PRODUCTION,
    development: process.env.MONGODB_URI_DEVELOPMENT,
    test: process.env.MONGODB_URI_TEST,
}

module.exports = config;

