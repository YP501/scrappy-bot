const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const Warn = require('../../structures/schemas/warn');
const embeds = require('../../util/builders/embeds').moderation.warn;
const { channels } = require('../../config.json');
const { generateId } = require('../../util/functions');

const info = new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Interact with the warn system')

    .addSubcommand(cmd => cmd // Warn add
        .setName('add')
        .setDescription('Add a warn to a user')
        .addUserOption(option => option
            .setName('user')
            .setDescription('Select a user')
            .setRequired(true))
        .addStringOption(option => option
            .setName('warning')
            .setDescription('Provide a warning')
            .setRequired(true)))

    .addSubcommand(cmd => cmd // Warn get
        .setName('get')
        .setDescription('Get the warnings of a user')
        .addUserOption(option => option
            .setName('user')
            .setDescription('Select a user')
            .setRequired(true)))

    .addSubcommand(cmd => cmd // Warn remove single
        .setName('remove')
        .setDescription('Remove a single warning by warning ID')
        .addStringOption(option => option
            .setName('id')
            .setDescription('Provide a warning ID (use /warn get <@user> to find the warning id)')
            .setRequired(true)))

    .addSubcommand(cmd => cmd // Warn clear all
        .setName('clear')
        .setDescription('Clear all warnings for a user')
        .addUserOption(option => option
            .setName('user')
            .setDescription('Select a user')
            .setRequired(true)));

async function execute(inter) {
    await inter.deferReply();
    const { options, user, guild } = inter;
    const targetUser = inter.options.getUser('user');

    switch (options.getSubcommand()) {
        case 'add': // Warning add
            const warningString = options.getString('warning');
            if (warningString.length > 350) {
                await inter.editReply('Cancelled command');
                await inter.followUp({ content: 'Keep your warning under 350 characters! (includes spaces)', ephemeral: true });
                return;
            };

            await new Warn({
                warning: warningString,
                target: targetUser.id,
                moderator: user.id,
                id: generateId(10),
                time: Math.floor(new Date().getTime() / 1000)
            }).save();

            // TODO: Add warning role system

            await inter.editReply({ embeds: [embeds.responseAdd(targetUser, warningString)] });
            await guild.channels.cache.get(channels.log.warn).send({ embeds: [embeds.log(inter, targetUser)] });
            try {
                await targetUser.send({ embeds: [embeds.dm(inter, warningString)] });
            } catch (err) {
                console.error(err);
                await inter.followUp({ content: "Couldn't DM user, they have still been warned", ephemeral: true });
            }
            return;

        case 'get': // Warning get
            const userWarnings = await Warn.find({ target: targetUser.id });
            if (!userWarnings.length) return await inter.editReply('No warnings found for this user');
            await inter.editReply({ embeds: [embeds.responseGet(inter, targetUser, userWarnings)] });
            return;

        case 'remove': // Warning remove
            const warningId = options.getString('id');
            const warning = await Warn.findOne({ id: warningId });
            if (!warning) {
                await inter.editReply('Cancelled command');
                await inter.followUp({ content: `Couldn't find a warning with ID \`${warningId}\``, ephemeral: true });
                return;
            }
            await warning.remove();
            await inter.editReply(`Succesfully removed warning with ID \`${warningId}\``) // TODO: make a sexy embed for this
            return;

        case 'clear':
            const clearButtons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('clearWarns_yes')
                        .setLabel('Yes')
                        .setStyle('Success'),
                    new ButtonBuilder()
                        .setCustomId('clearWarns_no')
                        .setLabel('No')
                        .setStyle('Danger')
                )
            inter.editReply({
                content: `Are you sure you want to clear all warnings for \`${targetUser.tag}\`?`,
                components: [clearButtons]
            });

            const filter = pressedButton => pressedButton.customId === 'clearWarns_yes' || pressedButton.customId === 'clearWarns_no';
            const collector = inter.channel.createMessageComponentCollector({ filter, time: 10000 });

            let interacted = false;
            collector.on('collect', async buttonInter => {
                if (buttonInter.user.id !== user.id) return buttonInter.reply({
                    content: 'Those buttons are not for you!',
                    ephemeral: true
                });
                collector.stop();
                interacted = true;

                switch (buttonInter.customId) {
                    case 'clearWarns_yes':
                        const deletedWarns = await Warn.deleteMany({ target: targetUser.id });
                        if (!deletedWarns.deletedCount) return inter.editReply({ content: 'No warnings were found for this user', components: [] });
                        inter.editReply({ content: `Succesfully removed ${deletedWarns.deletedCount} warnings for ${targetUser.tag}`, components: [] });


                    case 'clearWarns_no':
                        return inter.editReply({ content: 'Cancelled command', components: [] });
                }
            });

            collector.on('end', (collected) => {
                if (!interacted && !collected.some(item => item.user.id === user.id)) inter.editReply({ content: 'Interaction ran out of time', components: [] });
            });
    };
};

module.exports = {
    info,
    execute
};