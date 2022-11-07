const { channels } = require('../../config.json');
const { misc: miscEmbeds } = require('../../util/builders/embeds');

module.exports.execute = (client) => {
    process.on('unhandledRejection', (reason) => {
        console.log('[Anti-crash] :: Unhandled Rejection');
        console.log(reason);
        console.log('\n');
        client.channels.cache.get(channels.error).send({ embeds: [miscEmbeds.error('unhandledRejection', reason)] });
    });

    process.on('uncaughtException', (err) => {
        console.log('[Anti-crash] :: Uncaught Exception');
        console.log(err);
        console.log('\n');
        client.channels.cache.get(channels.error).send({ embeds: [miscEmbeds.error('uncaughtException', err)] });
    });
};
