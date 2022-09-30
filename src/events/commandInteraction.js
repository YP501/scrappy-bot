const { InteractionType } = require('discord-api-types/v10');
const { cmdCooldown } = require('../config.json');
const onCooldown = new Set();

module.exports = {
    name: 'interactionCreate',
    once: false,
    execute(inter) {
        if (inter.type !== InteractionType.ApplicationCommand) return;
        if (onCooldown.has(inter.user.id)) return inter.reply({ content: 'Not so fast! Please wait 2 seconds before using a command again', ephemeral: true });

        const cmd = inter.client.commands.get(inter.commandName);
        cmd.execute(inter)
            ?.catch(async err => {
                try {
                    await inter.reply({ content: 'An error has occured while executing the command! If this issue persists, please contact <@513709333494628355>', ephemeral: true })
                } catch (_) {
                    await inter.followUp({ content: 'An error has occured while executing the command! If this issue persists, please contact <@513709333494628355>', ephemeral: true });
                } finally {
                    throw err;
                };
            });

        onCooldown.add(inter.user.id);
        setTimeout(_ => { onCooldown.delete(inter.user.id) }, cmdCooldown);
    }
};