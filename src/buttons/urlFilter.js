const { channels } = require('../config.json');
const userButtons = require('../util/static/buttons').misc.foundBlacklistedUrl;
const modButtons = require('../util/static/buttons').misc
const embeds = require('../util/static/embeds').util;

module.exports = {
    id: 'urlmistake',
    execute(inter) {
        const { client } = inter;
        const reviewChannel = client.channels.cache.get(channels.filterReview);

        inter.update({ components: [userButtons.disabled()] })
        .then(_ => reviewChannel.send({ embeds: [embeds.filterReport(inter)], components: [modButtons.filterReport()] }))
    }
};