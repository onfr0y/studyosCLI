import chalk from 'chalk';
import readline from 'readline';

export async function startPomodoro() {
  const WORK_TIME = 50 * 60; // 50 minutes in seconds
  const BREAK_TIME = 10 * 60; // 10 minutes in seconds

  console.log(chalk.bold.blue('\n--- Study OS Pomodoro Started ---'));
  console.log(chalk.gray(' (Press "s" to stop/skip the current session)'));
  
  const interruptedWork = await runTimer(WORK_TIME, 'WORK (50m)');
  
  if (interruptedWork) {
    console.log(chalk.yellow('\n--- Study session stopped early. ---'));
    return;
  }

  process.stdout.write('\x07'); // Terminal beep
  console.log(chalk.bold.green('\n--- Time for a break! ---'));
  
  const interruptedBreak = await runTimer(BREAK_TIME, 'BREAK (10m)');
  
  if (interruptedBreak) {
    console.log(chalk.yellow('\n--- Break interrupted. ---'));
    return;
  }

  process.stdout.write('\x07'); // Terminal beep
  console.log(chalk.bold.blue('\n--- Break over! Ready for the next session? ---'));
}

function runTimer(seconds: number, label: string): Promise<boolean> {
  return new Promise((resolve) => {
    let timeLeft = seconds;
    
    // Setup keypress listener
    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }

    const handleKeypress = (str: string, key: any) => {
      if (key.name === 's') {
        cleanup();
        resolve(true); // true means interrupted
      }
      if (key.ctrl && key.name === 'c') {
        cleanup();
        process.exit();
      }
    };

    process.stdin.on('keypress', handleKeypress);

    const interval = setInterval(() => {
      const minutes = Math.floor(timeLeft / 60);
      const secs = timeLeft % 60;
      const formattedTime = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      
      process.stdout.write(`\r${chalk.yellow(label)}: ${chalk.white(formattedTime)} `);
      
      if (timeLeft <= 0) {
        cleanup();
        resolve(false); // false means completed normally
      }
      timeLeft--;
    }, 1000);

    function cleanup() {
      clearInterval(interval);
      process.stdin.removeListener('keypress', handleKeypress);
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
      }
      process.stdin.pause();
    }
  });
}
