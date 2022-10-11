const { SlashCommandBuilder } = require('discord.js');
const Infraction = require('../../structures/schemas/infraction');
const embeds = require('../../util/static/embeds').moderation.timeout;
const config = require('../../config.json');
const ms = require('ms');

const info = new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout a member from the server')
    .addUserOption((option) => option.setName('target').setDescription('The user to be timed out').setRequired(true))
    .addStringOption((option) => option.setName('time').setDescription('10s = 10 seconds, 10m = 10 minutes, 10h = 10 hours, 10d = 10 days').setRequired(true))
    .addStringOption((option) => option.setName('reason').setDescription('The reason for timing out this user (not required)'));

const execute = async (inter) => {
    await inter.deferReply();
    const { options, guild, user } = inter;

    const timeoutLength = ms(options.getString('time'));
    if (isNaN(timeoutLength)) return inter.editReply('Invalid time provided');
    if (timeoutLength < 10000 || timeoutLength > 2419200000) {
        await inter.editReply('Cancelled command');
        await inter.followUp({ content: 'Timeout length range is 10 seconds minimum and 28 days maximum', ephemeral: true });
        return;
    }

    const timeoutReason = options.getString('reason') || 'No reason provided';
    if (timeoutReason.length > 350) {
        await inter.editReply('Cancelled command');
        await inter.followUp({ content: 'Keep your timeout reason under 350 characters! (includes spaces)', ephemeral: true });
        return;
    }

    const targetMember = options.getMember('target');
    try {
        await targetMember.timeout(timeoutLength, timeoutReason);
    } catch (err) {
        await inter.editReply('Cancelled command');
        await inter.followUp({
            content: "An error occured while timing out the user, they might already be muted or I don't have the permission to mute them",
            ephemeral: true,
        });
        return;
    }
    await new Infraction({
        type: ' timeout',
        target: targetMember.user.id,
        moderator: user.id,
        reason: timeoutReason,
        time: Math.floor(new Date().getTime() / 1000),
    }).save();

    const formattedTimeoutLength = ms(timeoutLength, { long: true });

    try {
        await targetMember.send({ embeds: [embeds.dm(inter, timeoutReason, formattedTimeoutLength)] });
    } catch (err) {
        console.error(err);
        await inter.followUp({ content: "Couldn't DM user, they have still been timed out", ephemeral: true });
    }
    await guild.channels.cache.get(config.channels.log.timeout).send({ embeds: [embeds.log(targetMember, timeoutReason, inter, formattedTimeoutLength)] });
    await inter.editReply({ embeds: [embeds.response(targetMember, timeoutReason, formattedTimeoutLength)] });
};

module.exports = {
    info,
    execute,
};
