module.exports = {
    name: 'interactionCreate',
    once: false,
    execute(inter) {
        if (!inter.isButton()) return;
        const button = inter.client.buttons.get(inter.customId);
        button?.execute(inter)
            ?.catch(async err => {
                try {
                    await inter.reply({ content: 'An error has occured while executing the button! If this issue persists, please contact <@513709333494628355>', ephemeral: true })
                } catch (_) {
                    await inter.followUp({ content: 'An error has occured while executing the  button! If this issue persists, please contact <@513709333494628355>', ephemeral: true });
                } finally {
                    throw err;
                };
            });;
    }
};