const { readFileSync } = require('fs');
const embeds = require('./builders/embeds').util;
const buttons = require('./builders/buttons').misc.foundBlacklistedUrl;

function filterUrl(msg) {
    // const regex = /https?:\/\/[^\s$.?#].[^\s]*$/gm;
    const regex = /(?:(?:https?|ftp):\/\/)?[\w/\-?=%.]+\.[\w/\-&?=%.]+/
    const regexResult = regex.exec(msg.content);

    if (regexResult) {
        const whitelistedDomains = readFileSync('./src/util/whitelistedDomains.txt', 'utf-8').split('\r\n');
        const whitelisted = whitelistedDomains.some(domain => msg.content.toLowerCase().includes(domain))
        if (whitelisted) return
        msg.delete()
            .then(_ => {
                msg.member.send({
                    embeds: [embeds.foundBlacklistedUrl(regexResult)],
                    components: [buttons.enabled()]
                })
            })
            .catch(_ => { });
    };
};

module.exports = {
    filterUrl
};