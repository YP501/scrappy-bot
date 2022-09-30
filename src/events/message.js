const { filterUrl } = require('../util/filters');

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(msg) {
        if (msg.author.bot) return;
        filterUrl(msg);
    }
};