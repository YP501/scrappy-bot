const mongoose = require('mongoose');
const Levels = require('discord-xp');

module.exports.execute = () => {
    mongoose.connect(process.env.dbAuthDev, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(_ => {
        console.log('Connected to DataBase');
        Levels.setURL(process.env.dbAuthDev).then(_ => console.log('Level system ready to go\n'));
    });
};