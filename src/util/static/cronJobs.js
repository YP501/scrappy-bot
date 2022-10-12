const CronJob = require('cron').CronJob;

const autoUnban = (guild, userId, time) => {
    const currentTime = new Date().getTime();
    const unbanTime = new Date(currentTime + time);
    const unbanner = new CronJob(unbanTime, () => {
        guild.memberks.unban(userId, 'Ban expired');
        unbanner.stop();
    });
    unbanner.start();
};

module.exports = {
    autoUnban,
};
