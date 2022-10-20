const { SlashCommandBuilder } = require('discord.js');
const Infraction = require('../../structures/schemas/infraction');
const { errorEmbed, warningEmbed, successEmbed, moderation: modEmbeds } = require('../../util/builders/embeds');
const { timeout: timeoutEmbeds } = modEmbeds;
const config = require('../../config.json');
const ms = require('ms');

const info = new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout a member from the server')
    .addUserOption((option) => option.setName('target').setDescription('The user to be timed out').setRequired(true))
    .addStringOption((option) => option.setName('time').setDescription('10s = 10 seconds, 10m = 10 minutes, 10h = 10 hours, 10d = 10 days').setRequired(true))
    .addStringOption((option) => option.setName('reason').setDescription('The reason for timing out this user (not required)'));

const execute = async (inter) => {
    const { options, guild, user: modUser } = inter;

    const timeoutLength = ms(options.getString('time'));
    if (isNaN(timeoutLength)) return inter.reply({ embeds: [errorEmbed('Time provided was invalid')], ephemeral: true });
    if (timeoutLength < 10000 || timeoutLength > 2419200000) {
        await inter.reply({ embeds: [errorEmbed('Timeout length range is 10 seconds minimum and 28 days maximum!')], ephemeral: true });
        return;
    }

    const timeoutReason = options.getString('reason') || 'No reason provided';
    if (timeoutReason.length > 350) {
        await inter.reply({ embeds: [errorEmbed('Keep your reason under 350 characters!')], ephemeral: true });
        return;
    }

    const targetMember = options.getMember('target');
    const { user: targetUser } = targetMember;
    try {
        await targetMember.timeout(timeoutLength, timeoutReason);
    } catch (err) {
        await inter.reply({ embeds: [errorEmbed('User might already be muted or I cannot mute them!')], ephemeral: true });
        return;
    }
    await new Infraction({
        type: ' timeout',
        target: targetUser.id,
        moderator: modUser.id,
        reason: timeoutReason,
        time: Math.floor(new Date().getTime() / 1000),
    }).save();

    const formattedTimeoutLength = ms(timeoutLength, { long: true });

    try {
        await targetUser.send({ content: 'You have recieved a timeout:', embeds: [timeoutEmbeds.dm(inter, timeoutReason, formattedTimeoutLength)] });
    } catch (err) {
        console.error(err);
        await inter.followUp({ embeds: [warningEmbed('Unable to DM user!')], ephemeral: true });
    }
    await guild.channels.cache.get(config.channels.log.timeout).send({ embeds: [timeoutEmbeds.log(targetMember, timeoutReason, inter, formattedTimeoutLength)] });
    await inter.reply({ embeds: [successEmbed(`***${targetUser.tag} has been timed out ||*** **${timeoutReason}**`)] });
};

module.exports = {
    info,
    execute,
};
