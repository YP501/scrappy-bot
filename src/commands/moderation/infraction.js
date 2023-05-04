const { SlashCommandBuilder } = require('discord.js');
const { Infraction } = require('../../structures/schemas/infraction');

const info = new SlashCommandBuilder()
    .setName('infraction')
    .setDescription('Interact with the infraction system')

    // Infraction get
    .addSubcommand((command) =>
        command
            .setName('get')
            .setDescription('Fetch infraction entries from the database for a user')
            .addUserOption((option) => option.setName('target').setDescription('Select the user you want to get the infractions from').setRequired(true))
            .addStringOption((option) =>
                option
                    .setName('type')
                    .setDescription('The type of infraction you want to fetch')
                    .addChoices({ name: 'Ban', value: 'ban' }, { name: 'Warning', value: 'warning' }, { name: 'Any', value: 'any' })
                    .setRequired(true)
            )
    );

const execute = async (inter) => {
    const { options } = inter;
    switch (options.getSubcommand()) {
        case 'get': {
            const targetUser = options.getUser('target');
            const infractionType = options.getString('type');
            let userInfractions;
            if (infractionType === 'any') {
                userInfractions = await Infraction.find({ target: targetUser.id });
            } else {
                userInfractions = await Infraction.find({ target: targetUser.id, type: infractionType });
            }
            inter.reply(userInfractions.toString());
        }
    }
};

module.exports = {
    info,
    execute,
};
