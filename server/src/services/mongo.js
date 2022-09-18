const mongoose = require('mongoose');

const MONGO_URL = 'mongodb+srv://nasa-api:E15XFZdbj6GsfZJJ@nasacluser.6tehqgn.mongodb.net/nasa?retryWrites=true&w=majority';

mongoose.connection.once('open', () => {
    console.log('MongoDB connection ready');
});

mongoose.connection.on('error', (err) => {
    console.error(err);
});

async function mongoConnect() {
    mongoose.connect(MONGO_URL);
}
async function mongoDisconnect() {
    mongoose.disconnect();
}

module.exports = {
    mongoConnect,
    mongoDisconnect
};