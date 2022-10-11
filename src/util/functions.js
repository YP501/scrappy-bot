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
    const highlighed = `[${input.substring(startIndex, endIndex)}]`;
    const lastChars = input.substring(endIndex, afterIndex);

    return firstChars + highlighed + lastChars;
};

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

module.exports = {
    formatTime,
    formatBlacklist,
    generateId,
};
