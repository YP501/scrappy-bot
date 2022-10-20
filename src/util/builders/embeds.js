const { EmbedBuilder, codeBlock } = require('discord.js');
const { formatTime, formatBlacklist } = require('../functions');
const { emojis } = require('../../config.json');
const { version } = require('../../../package.json');
const unixCode = new Date().getTime();

const fun = {
    reddit: (post) => {
        return new EmbedBuilder()
            .setTitle(`From r/${post.subreddit}`)
            .setDescription(post.title)
            .setURL(`https://reddit.com${post.permalink}`)
            .setImage(post.url)
            .setColor('Purple');
    },
    eightBall: (user, question, answer) => {
        return new EmbedBuilder()
            .setAuthor({ name: `${user.tag} asked the magic 8ball a question`, iconURL: user.displayAvatarURL() })
            .addFields({ name: 'Question', value: question }, { name: 'Answer', value: answer })
            .setColor('Purple');
    },
};

const info = {
    about: (client) => {
        return (
            new EmbedBuilder()
                .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
                // ⚠ Do not change the fields of this embed as to keep the credit for the original author! ⚠
                .addFields(
                    { name: 'Version', value: version, inline: true },
                    { name: 'Developer', value: '<@513709333494628355>', inline: true },
                    { name: 'Source Code', value: '[Github](https://github.com/YP501/scrappy-bot)', inline: true }
                )
                .setFooter({ text: `Uptime: ${formatTime(new Date().getTime() - unixCode)} | © 2022 YP501` })
                .setColor('Purple')
        );
    },
    ping: (wsPing, ping) => {
        return new EmbedBuilder()
            .setTitle('🏓 Pong!')
            .addFields({ name: 'Bot latency', value: `${ping}ms`, inline: true }, { name: 'API latency', value: `${Math.round(wsPing)}ms`, inline: true })
            .setColor('Purple');
    },
};

const moderation = {
    // TODO: try to automate dm and log with infraction DB entries (follow warning dm and log embed setup)
    timeout: {
        dm: (modUser, timeoutReason, formattedTimeoutLength) => {
            return new EmbedBuilder()
                .setTitle('Timeout information')
                .setDescription(timeoutReason)
                .addFields({ name: 'Length', value: formattedTimeoutLength }, { name: 'Moderator', value: `<@${modUser.id}>` })
                .setColor('Red');
        },
        log: (targetMember, timeoutReason, inter, formattedTimeoutLength) => {
            return new EmbedBuilder()
                .setTitle('New timeout')
                .setAuthor({
                    name: targetMember.user.tag,
                    iconURL: targetMember.user.displayAvatarURL(),
                })
                .addFields(
                    { name: 'User', value: `<@${targetMember.user.id}>`, inline: true },
                    { name: 'Moderator', value: `<@${inter.user.id}>`, inline: true },
                    { name: 'Reason', value: timeoutReason },
                    { name: 'Time', value: formattedTimeoutLength }
                )
                .setFooter({ text: `User ID: ${targetMember.user.id}` })
                .setColor('Purple');
        },
    },
    warn: {
        log: (savedWarn, messageUrl) => {
            return new EmbedBuilder()
                .setTitle('New warning')
                .setURL(messageUrl)
                .setDescription(savedWarn.warning)
                .addFields(
                    { name: 'User', value: `<@${savedWarn.target}>`, inline: true },
                    { name: 'Moderator', value: `<@${savedWarn.moderator}>`, inline: true },
                    { name: 'Date', value: `<t:${savedWarn.time}:f>` }
                )
                .setFooter({ text: `Warning ID: ${savedWarn.id} | User ID: ${savedWarn.target}` })
                .setColor('Purple');
        },
        dm: (savedWarn) => {
            return new EmbedBuilder()
                .setTitle('Warning Information')
                .setDescription(savedWarn.warning)
                .addFields(
                    { name: 'Time', value: `<t:${savedWarn.time}:f>` },
                    { name: 'Moderator', value: `<@${savedWarn.moderator}>` },
                    { name: 'Appeal', value: 'To appeal, please join the appeals discord server: `https://discord.gg/vk4KtGGW`' }
                )
                .setFooter({ text: `Warning ID: ${savedWarn.id}` })
                .setColor('Red');
        },
        responseGet: (inter, targetUser, userWarnings) => {
            const embed = new EmbedBuilder()
                .setAuthor({
                    name: `Showing warnings for ${targetUser.tag}`,
                    iconURL: targetUser.displayAvatarURL(),
                })
                .setFooter({ text: `User ID: ${targetUser.id}` })
                .setColor('Purple');

            for (const warn of userWarnings) {
                embed.addFields({
                    name: `ID: ${warn.id} | Moderator: ${inter.guild.members.cache.get(warn.moderator).user.tag}`,
                    value: `**Warning:** ${warn.warning}\n<t:${warn.time}:f>`,
                });
            }
            return embed;
        },
        responseRemove: (savedWarn) => {
            return new EmbedBuilder()
                .setTitle('Removed Warning')
                .setDescription(savedWarn.warning)
                .addFields(
                    { name: 'User', value: `<@${savedWarn.target}>` },
                    { name: 'Moderator', value: `<@${savedWarn.moderator}>` },
                    { name: 'Time', value: `<t:${savedWarn.time}:f>` }
                )
                .setFooter({ text: `Warning ID: ${savedWarn.id}` })
                .setColor('Purple');
        },
        responseShow: (savedWarn) => {
            return new EmbedBuilder()
                .setTitle('Warning Information')
                .setDescription(savedWarn.warning)
                .addFields(
                    { name: 'User', value: `<@${savedWarn.target}>` },
                    { name: 'Moderator', value: `<@${savedWarn.moderator}>` },
                    { name: 'Time', value: `<t:${savedWarn.time}:f>` }
                )
                .setFooter({ text: `Warning ID: ${savedWarn.id}` })
                .setColor('Purple');
        },
    },
};

const misc = {
    error: (type, err) => {
        return new EmbedBuilder()
            .setTitle('⚠ New Error')
            .setDescription('Check the bot console for more information')
            .addFields({ name: 'Type', value: type }, { name: 'Error', value: `\`${err.message}\`` })
            .setFooter({ text: 'Anti-Crash System™' })
            .setColor('Red');
    },
};

const util = {
    foundBlacklistedUrl: (regexResult) => {
        return new EmbedBuilder()
            .setTitle('URL Blacklist Match Found')
            .setDescription(codeBlock(regexResult.input))
            .addFields({ name: 'Matched URL', value: codeBlock('css', formatBlacklist(regexResult, 10)) })
            .setFooter({ text: 'Click the button below if this is a false positive (mistake).' })
            .setColor('Red');
    },
};

const clientEvents = {
    guildBanAdd: (guildBan) => {
        const { user: bannedUser, reason } = guildBan;
        return new EmbedBuilder().setDescription(`🔨 **User banned:** ${bannedUser.tag} (${bannedUser.id})\n\n**Reason:** ${reason || 'No reason provided'}`).setColor('Red');
    },
    guildBanRemove: (guildBan) => {
        const { user: bannedUser } = guildBan;
        return new EmbedBuilder().setDescription(`🍃 User unbanned: ${bannedUser.tag} (${bannedUser.id})`).setColor('Green');
    },
    guildMemberAddLog: (member) => {
        const { user } = member;
        return new EmbedBuilder()
            .setDescription(
                `📥 **User Joined**\n<@${user.id}> | ${user.tag} (${user.id})\n\n**User Created:**\n<t:${Math.floor(user.createdTimestamp / 1000)}:f> (<t:${Math.floor(
                    user.createdTimestamp / 1000
                )}:R>)`
            )
            .setThumbnail(user.displayAvatarURL())
            .setColor('Green');
    },
    guildMemberAddWelcome: (member) => {
        const { user, guild } = member;
        return new EmbedBuilder()
            .setTitle('New user joined!')
            .setDescription(`Welcome to __${member.guild.name}__, **${user.tag}**!`)
            .setThumbnail(user.displayAvatarURL())
            .setFooter({ text: `Member #${guild.memberCount}` })
            .setColor('Purple');
    },
    guildMemberRemoveLog: (member) => {
        const { user } = member;
        return new EmbedBuilder().setDescription(`📤 **User Left**\n<@${user.id}> | ${user.tag} (${user.id})`).setThumbnail(user.displayAvatarURL()).setColor('Red');
    },
    guildMemberRemoveWelcome: (member) => {
        const { user } = member;
        return new EmbedBuilder().setTitle('User left!').setDescription(`**${user.tag}** got griddied on`).setColor('Red');
    },
};

const errorEmbed = (string) => new EmbedBuilder().setDescription(`${emojis.cross} ${string}`).setColor('Red');
const warningEmbed = (string) => new EmbedBuilder().setDescription(`${emojis.warning} ${string}`).setColor('Orange');
const successEmbed = (string) => new EmbedBuilder().setDescription(`${emojis.check} ${string}`).setColor('Green');

module.exports = {
    fun,
    info,
    moderation,
    misc,
    util,
    clientEvents,
    errorEmbed,
    warningEmbed,
    successEmbed,
};
