const mongoose = require('mongoose');

const Infraction = new mongoose.Schema({
    type: {
        type: String,
        required: true,
    },
    target: {
        type: String,
        required: true,
    },
    moderator: {
        type: String,
        required: true,
    },
    reason: {
        type: String,
        required: false,
        default: 'No reason provided',
    },
    time: {
        type: String,
        required: true,
    },
    id: {
        type: String,
        required: true,
    },
});

module.exports.Infraction = mongoose.model('Infraction', Infraction);
