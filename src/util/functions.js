const { ActionRowBuilder, ButtonBuilder } = require('discord.js');

/**
 * Formats the provided unix time code into the uptime of the bot
 * @param {Number} unix
 * @returns <x>hrs, <y>min, <z>sec
 */

const formatTime = (unix) => {
    const hoursUnformatted = unix / 3600000;
    const hours = Math.floor(hoursUnformatted);
    let timeLeft = hoursUnformatted % 1;

    const minutesUnformatted = timeLeft * 60;
    const minutes = Math.floor(minutesUnformatted);
    timeLeft = minutesUnformatted % 1;

    const seconds = Math.round(timeLeft * 60);

    return `${hours}hrs, ${minutes}min, ${seconds}sec`;
};

/**
 * Returns a highlighted string in a text based on the probided regex with n surrounding characters
 * @param {Object} regexResult
 * @param {Number} n
 * @returns String with characters surrounding the regex result
 */

const formatBlacklist = (regexResult, n) => {
    const input = regexResult.input;
    const found = regexResult[0];
    const startIndex = regexResult.index;
    n += 1;

    let beforeIndex = startIndex - n;
    if (!input[beforeIndex]) beforeIndex = 0;

    const endIndex = startIndex + found.length;
    let afterIndex = endIndex + n;
    while (!input[afterIndex - 1]) afterIndex--;

    const firstChars = input.substring(beforeIndex, startIndex);
    const highlighted = `[${input.substring(startIndex, endIndex)}]`;
    const lastChars = input.substring(endIndex, afterIndex);

    return firstChars + highlighted + lastChars;
};

/**
 * Returns a randomly generated string consisting of numbers of "length" length. If mixed === true, it will include characters, defaults to false
 * @param {Number} length
 * @param {Booleon} mixed
 * @returns String of "length" length
 */

const generateId = (length, mixed = false) => {
    let result = '';
    let chars = '0123456789';
    const mixedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    if (mixed === true) chars = mixedChars;

    for (var i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
};

/**
 * Returns a row with the disabled versions of the provided buttons which are in the row param
 * @param {Object} row
 * @returns Row with disabled buttons
 */

const disablifyButtons = (row) => {
    const buttons = [];
    const buttonsJson = row.components;
    buttonsJson.forEach((button) => buttons.push(ButtonBuilder.from(button).setDisabled(true)));
    return new ActionRowBuilder().addComponents(buttons);
};

module.exports = {
    formatTime,
    formatBlacklist,
    generateId,
    disablifyButtons,
};
