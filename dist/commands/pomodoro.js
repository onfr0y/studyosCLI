import chalk from 'chalk';
export async function startPomodoro() {
    const WORK_TIME = 50 * 60; // 50 minutes in seconds
    const BREAK_TIME = 10 * 60; // 10 minutes in seconds
    console.log(chalk.bold.blue('\n--- Study OS Pomodoro Started ---'));
    await runTimer(WORK_TIME, 'WORK (50m)');
    process.stdout.write('\x07'); // Terminal beep
    console.log(chalk.bold.green('\n--- Time for a break! ---'));
    await runTimer(BREAK_TIME, 'BREAK (10m)');
    process.stdout.write('\x07'); // Terminal beep
    console.log(chalk.bold.blue('\n--- Break over! Ready for the next session? ---'));
}
function runTimer(seconds, label) {
    return new Promise((resolve) => {
        let timeLeft = seconds;
        const interval = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const secs = timeLeft % 60;
            const formattedTime = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            process.stdout.write(`\r${chalk.yellow(label)}: ${chalk.white(formattedTime)} `);
            if (timeLeft <= 0) {
                clearInterval(interval);
                resolve();
            }
            timeLeft--;
        }, 1000);
    });
}
