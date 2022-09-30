const { channels } = require('../../config.json');
const embeds = require('../../util/builders/embeds').misc;

module.exports.execute = (client) => {
    process.on('unhandledRejection', (reason, promise) => {
        console.log('[Anti-crash] :: Unhandled Rejection');
        console.log(reason);
        console.log('\n');
        client.channels.cache.get(channels.error).send({ embeds: [embeds.error('unhandledRejection', reason)] });
    });

    process.on('uncaughtException', (err, origin) => {
        console.log('[Anti-crash] :: Uncaught Exception');
        console.log(err);
        console.log('\n');
        client.channels.cache.get(channels.error).send({ embeds: [embeds.error('uncaughtException', err)] });
    });
};