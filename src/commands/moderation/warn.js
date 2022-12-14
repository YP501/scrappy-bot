const { SlashCommandBuilder } = require('discord.js');
const { Infraction } = require('../../structures/schemas/infraction');
const { moderation: modButtons } = require('../../util/builders/components');
const { errorEmbed, warningEmbed } = require('../../util/builders/embeds');
const { successEmbed, moderation: modEmbeds } = require('../../util/builders/embeds');
const { channels, roles } = require('../../config.json');
const { generateId } = require('../../util/functions');
const { autoUnban } = require('../../util/builders/cronJobs');

const info = new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Add a warning to a user')
    .addUserOption((option) => option.setName('user').setDescription('The user to give the warning to').setRequired(true))
    .addStringOption((option) => option.setName('warning').setDescription('The reason you are warning this user').setRequired(true));

const execute = async (inter) => {
    const { options, user: modUser, guild } = inter;
    const targetMember = inter.options.getMember('user');
    const { user: targetUser } = targetMember;

    const warningString = options.getString('warning');
    if (warningString.length > 350) {
        inter.reply({ embeds: [errorEmbed('Keep your warning under 350 characters!')], ephemeral: true });
        return;
    }

    const savedInfraction = await new Infraction({
        type: 'warning',
        target: targetUser.id,
        moderator: modUser.id,
        reason: warningString,
        time: Math.floor(new Date().getTime() / 1000),
        id: generateId(10),
    }).save();

    const { url: messageUrl } = await inter.reply({ embeds: [successEmbed(`**${targetUser.tag}** has been warned | ${warningString}`)] });
    await guild.channels.cache.get(channels.log.warn).send({ embeds: [modEmbeds.warn.log(savedInfraction, messageUrl)] });
    try {
        await targetUser.send({ content: 'You have recieved a warning:', embeds: [modEmbeds.warn.dm(savedInfraction)] });
    } catch (err) {
        await inter.followUp({ embeds: [warningEmbed('Was unable to DM user!')], ephemeral: true });
    }

    const warningAmount = await Infraction.count({ target: targetUser.id });
    if (warningAmount >= 3) {
        // TODO: Respond DM with ban infraction entry
        // await targetUser.send(ban embed here);
        await targetMember.ban({ deleteMessageSeconds: 604800, reason: `[ScrappyBot] User reached ${warningAmount} warnings` });
        autoUnban(guild, targetUser.id, 2592000000);

        // TODO: add confirm button for ban
        await inter.followUp({ embeds: [warningEmbed(`User was automatically banned for reaching ${warningAmount} warnings`)] });
        await Infraction.deleteMany({ target: targetUser.id });
    }
    if (warningAmount < 3 && warningAmount !== 0) {
        targetMember.roles.add(roles.warnings[warningAmount]);
        targetMember.roles.remove(roles.warnings[0]);
    }
};

module.exports = {
    info,
    execute,
};
