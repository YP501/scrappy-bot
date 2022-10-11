const mongoose = require('mongoose');
const Levels = require('discord-xp');

module.exports.execute = () => {
    mongoose
        .connect(process.env.dbAuthDev, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => {
            console.log('Connected to DataBase');
            Levels.setURL(process.env.dbAuthDev).then(() => console.log('Level system ready to go\n'));
        });
};
