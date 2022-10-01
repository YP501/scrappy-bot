const { EmbedBuilder, codeBlock } = require('discord.js');
const { formatTime, formatBlacklist } = require('../functions');
const config = require('../../config.json');

const fun = {
    reddit(post) {
        return new EmbedBuilder()
            .setTitle(`From r/${post.subreddit}`)
            .setDescription(post.title)
            .setURL(`https://reddit.com${post.permalink}`)
            .setImage(post.url)
            .setColor("Orange");
    }
};

const unixCode = new Date().getTime();

const info = {
    about(client, memberCount) {
        return new EmbedBuilder()
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
            .addFields(
                { name: 'Version', value: config.version, inline: true },
                { name: 'Library', value: '[Discord.js](https://discord.js.org/#/)', inline: true },
                { name: 'Developer', value: '<@513709333494628355>', inline: true },
                { name: 'Host', value: '[sparkedhost](https://sparkedhost.com/)', inline: true },
                { name: 'Credits', value: '[View here](https://pastebin.com/raw/sjgjNRA9)', inline: true },
                { name: 'Users', value: memberCount.toString(), inline: true }
            )
            .setFooter({ text: `Uptime: ${formatTime(new Date().getTime() - unixCode)} | © 2022 FrankieFms` })
            .setColor('Orange');
    },
    ping(inter, ping) {
        return new EmbedBuilder()
            .setTitle('🏓 Pong!')
            .addFields(
                { name: 'Bot latency', value: `${ping}ms`, inline: true },
                { name: 'API latency', value: `${Math.round(inter.client.ws.ping)}ms`, inline: true }
            )
            .setColor('Orange');
    }
};

const moderation = {
    timeout: {
        response(targetMember, timeoutReason, formattedTimeoutLength) {
            return new EmbedBuilder()
                .setAuthor({
                    name: `Timed out ${targetMember.user.tag}`,
                    iconURL: targetMember.user.displayAvatarURL()
                })
                .addFields(
                    { name: 'Reason', value: timeoutReason },
                    { name: 'Time', value: formattedTimeoutLength }
                )
                .setFooter({ text: `User ID: ${targetMember.user.id}` })
                .setColor('Green')
        },
        dm(inter, timeoutReason, formattedTimeoutLength) {
            return new EmbedBuilder()
                .setAuthor({
                    name: `You have been timed out in ${inter.guild.name}`,
                    iconURL: inter.guild.iconURL()
                })
                .addFields(
                    { name: 'Moderator', value: inter.user.tag },
                    { name: 'Time', value: formattedTimeoutLength },
                    { name: 'Reason', value: timeoutReason }
                )
                .setColor('Red')
                .setTimestamp()
        },
        log(targetMember, timeoutReason, inter, formattedTimeoutLength) {
            return new EmbedBuilder()
                .setTitle('New timeout')
                .setAuthor({
                    name: targetMember.user.tag,
                    iconURL: targetMember.user.displayAvatarURL()
                })
                .addFields(
                    { name: 'User', value: `<@${targetMember.user.id}>`, inline: true },
                    { name: 'Moderator', value: `<@${inter.user.id}>`, inline: true },
                    { name: 'Reason', value: timeoutReason },
                    { name: 'Time', value: formattedTimeoutLength }
                )
                .setColor('Red')
                .setFooter({ text: `User ID: ${targetMember.user.id}` })
                .setTimestamp()
        }
    },
    warn: {
        responseAdd(targetUser, savedWarn) {
            return new EmbedBuilder()
                .setAuthor({
                    name: `Succesfully warned ${targetUser.tag}`,
                    iconURL: targetUser.displayAvatarURL()
                })
                .addFields({ name: 'Warning', value: savedWarn.warning })
                .setFooter({ text: `Warning ID: ${savedWarn.id}` })
                .setColor('Green');
        },
        log(inter, targetUser) {
            return new EmbedBuilder()
                .setTitle('New warning')
                .setAuthor({
                    name: targetUser.tag,
                    iconURL: targetUser.displayAvatarURL()
                })
                .addFields(
                    { name: 'User', value: `<@${targetUser.id}>`, inline: true },
                    { name: 'Moderator', value: `<@${inter.user.id}>`, inline: true },
                    { name: 'Warning', value: inter.options.getString('warning') }
                )
                .setColor('Red')
                .setFooter({ text: `User ID: ${targetUser.id}` })
                .setTimestamp()
        },
        dm(moderatorTag, savedWarn) {
            return new EmbedBuilder()
                .setTitle('Warning Information')
                .setDescription(savedWarn.warning)
                .addFields(
                    { name: 'Time', value: `<t:${savedWarn.time}:R>`},
                    { name: 'Moderator', value: moderatorTag },
                    { name: 'Appeal', value: `To appeal, please dm a moderator or higher with the following ID: \`${savedWarn.id}\``}
                )
                .setColor('Red')
        },
        responseGet(inter, targetUser, userWarnings) {
            const embed = new EmbedBuilder()
                .setAuthor({
                    name: `Showing warnings for ${targetUser.tag}`,
                    iconURL: targetUser.displayAvatarURL()
                })
                .setFooter({ text: `User ID: ${targetUser.id}` })
                .setColor('Green');

            for (const warn of userWarnings) {
                embed.addFields({ name: `ID: ${warn.id} | Moderator: ${inter.guild.members.cache.get(warn.moderator).user.tag}`, value: `**Warning:** ${warn.warning}\n<t:${warn.time}:R>` });
            }
            return embed;
        },
        responseRemove(targetUser, warn) {
            return new EmbedBuilder()
                .setAuthor({
                    name: `Removed warning for ${targetUser.id}`,
                    iconURL: targetUser.displayAvatarURL
                })
                .addFields(
                    { name: 'ID', value: warn.id },
                    { name: 'Warning', value: warn.warning }
                )
                .setFooter({ text: `User ID: ${targetUser.id}` })
                .setColor('Green')
        }
    }
};

const misc = {
    error(type, err) {
        return new EmbedBuilder()
            .setTitle('⚠ New Error')
            .setDescription('Check the bot console for more information')
            .setFooter({ text: 'Anti-Crash System™' })
            .addFields(
                { name: 'Type', value: type },
                { name: 'Error', value: `\`${err.message}\`` }
            )
            .setColor('Red');
    }
};

const util = {
    foundBlacklistedUrl(regexResult) {
        return new EmbedBuilder()
            .setTitle('URL Blacklist Match Found')
            .setDescription(codeBlock(regexResult.input))
            .addFields(
                { name: 'Matched URL', value: codeBlock('css', formatBlacklist(regexResult, 10)) },
            )
            .setFooter({ text: 'Click the button below if this is a false positive (mistake).' })
            .setColor('Red');
    },
    filterReport(inter) {
        const { user, message } = inter;
        const msgEmbed = message.embeds[0];

        return new EmbedBuilder()
            .setTitle('New filter mistake report:')
            .setDescription(msgEmbed.description)
            .addFields(msgEmbed.fields[0])
            .setFooter({ text: `User ID: ${user.id}` })
            .setColor('Blue');
    },
    reportApproved(reportEmbed, user) {
        return new EmbedBuilder()
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
            .setTitle('Filter report')
            .setDescription(reportEmbed.description)
            .addFields(reportEmbed.fields[0])
            .setFooter({ text: `User ID: ${user.id}` })
            .setColor('Green')
    },
    reportEditApproved(reportEmbed, user) {
        return new EmbedBuilder()
            .setAuthor({ name: `Approved by ${user.tag}`, iconURL: user.displayAvatarURL() })
            .setDescription(reportEmbed.description)
            .addFields(reportEmbed.fields[0])
            .setFooter(reportEmbed.footer)
            .setColor('Green')
    },
    reportDeclined(reportEmbed, user) {
        return new EmbedBuilder()
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
            .setTitle('Filter report')
            .setDescription(reportEmbed.description)
            .addFields(reportEmbed.fields[0])
            .setFooter(reportEmbed.footer)
            .setColor('Red');
    },
    reportEditDeclined(reportEmbed, user) {
        return new EmbedBuilder()
            .setAuthor({ name: `Declined by ${user.tag}`, iconURL: user.displayAvatarURL() })
            .setDescription(reportEmbed.description)
            .addFields(reportEmbed.fields[0])
            .setFooter(reportEmbed.footer)
            .setColor('Red')
    }
};

module.exports = {
    fun,
    info,
    moderation,
    misc,
    util
};