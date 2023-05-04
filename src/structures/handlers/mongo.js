const mongoose = require('mongoose');

module.exports.execute = () => {
    mongoose
        .set('strictQuery', true)
        .connect(process.env.dbAuthDev, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => {
            console.log('Connected to DataBase');
        });
};
