const { SlashCommandBuilder, codeBlock } = require('discord.js');

const info = new SlashCommandBuilder()
    .setName('eval')
    .setDescription("Execute any piece of JavaScript code on the bot's end")
    .addBooleanOption(option =>
        option
            .setName('void')
            .setDescription("Decides if the bot replies with the output or no, set this to true if you want to be safe")
            .setRequired(true))
    .addStringOption(option =>
        option
            .setName('code')
            .setDescription('Put the JavaScript code you want executed here')
            .setRequired(true));

const execute = async (inter) => {
    const { user, options } = inter;

    // Permission check for eval
    if (user.id !== '513709333494628355' && user.id !== '365024863548866563') return await inter.reply({ content: 'Only bot devs can use that!', ephemeral: true });
    
    let output;
    try {
        output = await new Promise(resolve => resolve(eval(options.getString('code'))));
    } catch (err) {
        try {
            return await inter.reply(`**ERROR**:\n\`${err}\``);
        } catch {
            return await inter.followUp(`**ERROR**:\n\`${err}\``);
        }
    };

    if (options.getBoolean('void') === false) {
        if (typeof output !== 'string') output = require('util').inspect(output, { depth: 0 });
        try {
            await inter.reply(`**OUTPUT**:${codeBlock('js', output)}`);
        } catch {
            await inter.followUp(`**OUTPUT**:${codeBlock('js', output)}`);
        }
    } else {
        try {
            await inter.reply('Executed code successfully with no returned value!')
        } catch {
            await inter.followUp('Executed code successfully with no returned value!');
        }
    };
};

module.exports = {
    info,
    execute
};