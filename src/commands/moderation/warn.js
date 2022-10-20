const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const WarnCollection = require('../../structures/schemas/warn');
const { successEmbed, moderation: modEmbeds } = require('../../util/builders/embeds');
const { warn: warnEmbeds } = modEmbeds;
const { errorEmbed, warningEmbed } = require('../../util/builders/embeds');
const { channels, roles } = require('../../config.json');
const { generateId, disablifyButtons } = require('../../util/functions');
const { autoUnban } = require('../../util/builders/cronJobs');

const info = new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Interact with the warn system')

    .addSubcommand((cmd) =>
        cmd
            .setName('add')
            .setDescription('Add a warn to a user')
            .addUserOption((option) => option.setName('user').setDescription('Select a user').setRequired(true))
            .addStringOption((option) => option.setName('warning').setDescription('Provide a warning').setRequired(true))
    )

    .addSubcommand((cmd) =>
        cmd
            .setName('get')
            .setDescription('Get the warnings of a user')
            .addUserOption((option) => option.setName('user').setDescription('Select a user').setRequired(true))
    )

    .addSubcommand((cmd) =>
        cmd
            .setName('remove')
            .setDescription('Remove a single warning by warning ID')
            .addStringOption((option) => option.setName('id').setDescription('Provide a warning ID (use /warn get <@user> to find the warning id)').setRequired(true))
    )

    .addSubcommand((cmd) =>
        cmd
            .setName('clear')
            .setDescription('Clear all warnings for a user')
            .addUserOption((option) => option.setName('user').setDescription('Select a user').setRequired(true))
    )

    .addSubcommand((cmd) =>
        cmd
            .setName('show')
            .setDescription('Fetch a single warning with a warning ID')
            .addStringOption((option) => option.setName('id').setDescription('Provide a warning ID').setRequired(true))
    );

const execute = async (inter) => {
    const { options, user: modUser, guild } = inter;
    const targetMember = inter.options.getMember('user');
    const targetUser = targetMember?.user;

    switch (options.getSubcommand()) {
        case 'add': {
            const warningString = options.getString('warning');
            if (warningString.length > 350) {
                inter.reply({ embeds: [errorEmbed('Keep your warning under 350 characters!')], ephemeral: true });
                return;
            }

            const savedWarn = await new WarnCollection({
                warning: warningString,
                target: targetUser.id,
                moderator: modUser.id,
                id: generateId(10),
                time: Math.floor(new Date().getTime() / 1000),
            }).save();

            const { url: messageUrl } = await inter.reply({ embeds: [successEmbed(`***${targetUser.tag} has been warned ||*** **${warningString}**`)] });
            await guild.channels.cache.get(channels.log.warn).send({ embeds: [warnEmbeds.log(savedWarn, messageUrl)] });
            try {
                await targetUser.send({ content: 'You have recieved a warning:', embeds: [warnEmbeds.dm(savedWarn)] });
            } catch (err) {
                await inter.followUp({ embeds: [warningEmbed('Unable to DM user!')], ephemeral: true });
            }

            const warningAmount = await WarnCollection.count({ target: targetUser.id });
            if (warningAmount === 1) {
                targetMember.roles.remove(roles.warnings[0]);
            }
            if (warningAmount >= 3) {
                // TODO: Respond DM with ban infraction entry
                // await targetUser.send(ban embed here);
                await targetMember.ban({ deleteMessageSeconds: 604800, reason: `[ ScrappyBot ] User reached ${warningAmount} warnings` });
                autoUnban(guild, targetUser.id, 2592000000);
                await inter.followUp({ embeds: [warningEmbed(`User was automatically banned for reaching ${warningAmount} warnings`)] });
                await WarnCollection.deleteMany({ target: targetUser.id });
            }
            if (warningAmount < 3 && warningAmount !== 0) {
                targetMember.roles.add(roles.warnings[warningAmount]);
            }
            return;
        }

        case 'get': {
            const userWarnings = await WarnCollection.find({ target: targetUser.id });
            if (!userWarnings.length) return await inter.reply({ embeds: [errorEmbed('No warnings found for this user')] });
            await inter.reply({ embeds: [warnEmbeds.responseGet(inter, targetUser, userWarnings)] });
            return;
        }

        case 'remove': {
            const warningIdRemove = options.getString('id');
            const removeWarning = await WarnCollection.findOne({ id: warningIdRemove });
            if (!removeWarning) return await inter.reply({ embeds: [errorEmbed(`Couldn't find a warning with ID \`${warningIdRemove}\``)], ephemeral: true });
            await removeWarning.remove();
            await inter.reply({ embeds: [warnEmbeds.responseRemove(removeWarning)] });
            return;
        }

        case 'clear': {
            const clearButtonsId = generateId(5);
            const clearButtons = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`${clearButtonsId}_yes`).setLabel('Yes').setStyle('Success'),
                new ButtonBuilder().setCustomId(`${clearButtonsId}_no`).setLabel('No').setStyle('Danger')
            );
            const buttonMessage = await inter.reply({
                embeds: [warningEmbed(`Are you sure you want to clear all warnings for \`${targetUser.tag}\`?`)],
                components: [clearButtons],
                fetchReply: true,
            });

            const filter = (pressedButton) => pressedButton.customId === `${clearButtonsId}_yes` || pressedButton.customId === `${clearButtonsId}_no`;
            const collector = inter.channel.createMessageComponentCollector({ filter, time: 10000 });
            let interacted = false;

            collector.on('collect', async (buttonInter) => {
                if (buttonInter.user.id !== modUser.id)
                    return buttonInter.reply({
                        embeds: [errorEmbed('Those buttons are not for you!')],
                        ephemeral: true,
                    });
                collector.stop();
                interacted = true;

                switch (buttonInter.customId) {
                    case `${clearButtonsId}_yes`: {
                        const deletedWarns = await WarnCollection.deleteMany({ target: targetUser.id });
                        if (!deletedWarns.deletedCount) return buttonMessage.edit({ content: 'No warnings were found for this user', components: [] });
                        return buttonMessage.edit({
                            embeds: [successEmbed(`Succesfully removed ${deletedWarns.deletedCount} warnings for ${targetUser.tag}`)],
                            components: [],
                        });
                    }

                    case `${clearButtonsId}_no`: {
                        return buttonMessage.edit({ embeds: [successEmbed('Cancelled command')], components: [] });
                    }
                }
            });

            collector.on('end', (collectedInteractions) => {
                if (!collectedInteractions.some((entry) => entry.user.id === modUser.id) && interacted === false) {
                    buttonMessage.edit({
                        components: [disablifyButtons(buttonMessage.components[0])],
                    });
                }
            });
            return;
        }
        case 'show': {
            const warningIdShow = options.getString('id');
            const warnShow = await WarnCollection.findOne({ id: warningIdShow });
            if (!warnShow) {
                await inter.reply({ embeds: [errorEmbed(`Couldn't find a warning with ID \`${warningIdShow}\``)], ephemeral: true });
                return;
            }
            await inter.reply({ embeds: [warnEmbeds.responseShow(warnShow)] });
            return;
        }
    }
};

module.exports = {
    info,
    execute,
};
