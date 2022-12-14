const axios = require('axios');
const { util: utilEmbeds } = require('./builders/embeds');
const { misc: miscButtons } = require('./builders/components');

const filterUrl = async (msg) => {
    const regex = /(?:(?:https?|ftp):\/\/)?[\w/\-?=%.]+\.[\w/\-&?=%.]+/;
    const regexResult = regex.exec(msg.content);

    if (regexResult) {
        const res = await axios.get('https://pastebin.com/raw/sTeY0f7m');
        const whitelistedDomains = res.data.split('\r\n');
        const isWhitelisted = whitelistedDomains.some((domain) => msg.content.toLowerCase().includes(domain));
        if (isWhitelisted) return;
        msg.delete()
            .then(() => {
                msg.member.send({
                    embeds: [utilEmbeds.foundBlacklistedUrl(regexResult)],
                    components: [miscButtons.foundBlacklistedUrl()],
                });
            })
            .catch(() => {});
    }
};

module.exports = {
    filterUrl,
};
