const mongoose = require('mongoose');

const Warn = new mongoose.Schema({
    warning: {
        type: String,
        required: true
    },
    target: {
        type: String,
        required: true
    },
    moderator: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Warn', Warn);