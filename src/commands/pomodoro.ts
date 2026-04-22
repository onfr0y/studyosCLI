import chalk from 'chalk';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { readData, writeData } from '../utils/storage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function logHistory(type: 'work' | 'break', duration: number, sessionCount: number) {
  const data = readData();
  data.history.push({
    type,
    timestamp: new Date().toISOString(),
    duration,
    id: sessionCount,
  });
  writeData(data);
}

export async function startPomodoro() {
  let sessionCount = 1;

  // Load car ASCII
  let carAscii = '';
  try {
    const carPath = path.join(__dirname, '../utils/car.txt');
    carAscii = fs.readFileSync(carPath, 'utf-8');
  } catch (err) {
    // Fallback if file not found
    carAscii = '      __\n    _/  \\_\n   /      \\\n  |  AUTO  |\n   \\______/';
  }

  while (true) {
    const data = readData(); 
    const WORK_TIME_MIN = data.pomodoroSettings.workMinutes;
    const BREAK_TIME_MIN = data.pomodoroSettings.breakMinutes;
    const WORK_TIME = WORK_TIME_MIN * 60;
    const BREAK_TIME = BREAK_TIME_MIN * 60;

    console.log(chalk.bold.blue(`\n--- Pomodoro Session #${sessionCount} ---`));
    console.log(chalk.gray(` (Settings: ${WORK_TIME_MIN}m work / ${BREAK_TIME_MIN}m break)`));
    console.log(chalk.gray(' (Press "s" to skip/stop session, "q" to quit entirely)'));
    
    const resultWork = await runTimer(WORK_TIME, `WORK (${WORK_TIME_MIN}m)`, carAscii);
    
    if (resultWork === 'quit') {
      console.log(chalk.yellow('\n--- Study session ended. Great work! ---'));
      break;
    }

    if (resultWork === 'stop') {
      console.log(chalk.yellow('\n--- Work session skipped. ---'));
    } else {
      process.stdout.write('\x07');
      logHistory('work', WORK_TIME_MIN, sessionCount);
      console.log(chalk.bold.green('\n--- Time for a break! ---'));
    }
    
    const resultBreak = await runTimer(BREAK_TIME, `BREAK (${BREAK_TIME_MIN}m)`, carAscii);
    
    if (resultBreak === 'quit') {
      console.log(chalk.yellow('\n--- Break ended. Session stopped. ---'));
      break;
    }

    if (resultBreak === 'stop') {
      console.log(chalk.yellow('\n--- Break skipped. ---'));
    } else {
      process.stdout.write('\x07');
      logHistory('break', BREAK_TIME_MIN, sessionCount);
      console.log(chalk.bold.blue('\n--- Break over! ---'));
    }

    sessionCount++;
    console.log(chalk.cyan(`\nStarting next cycle... (Cycle #${sessionCount})`));
  }
}

export function editPomodoroSettings(work: string, breakTime: string) {
  const data = readData();
  const workMin = parseInt(work);
  const breakMin = parseInt(breakTime);

  if (isNaN(workMin) || isNaN(breakMin)) {
    console.log(chalk.red('Error: Please provide valid numbers for work and break minutes.'));
    return;
  }

  data.pomodoroSettings = {
    workMinutes: workMin,
    breakMinutes: breakMin,
  };

  writeData(data);
  console.log(chalk.green(`\nPomodoro settings updated to ${workMin}m work and ${breakMin}m break.`));
}

function runTimer(seconds: number, label: string, carAscii: string): Promise<'done' | 'stop' | 'quit'> {
  return new Promise((resolve) => {
    let timeLeft = seconds;
    const carLines = carAscii.split('\n').filter(line => line.trim() !== '' || line.length > 0);
    // Remove the very last line if it's just whitespace (often an artifact of the editor)
    if (carLines.length > 0 && carLines[carLines.length - 1].trim() === '') {
      carLines.pop();
    }
    
    const carHeight = carLines.length;
    const timerLineIndex = Math.floor(carHeight / 2);

    // Setup keypress listener
    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }

    const handleKeypress = (str: string, key: any) => {
      if (key.name === 's') {
        cleanup();
        resolve('stop');
      }
      if (key.name === 'q') {
        cleanup();
        resolve('quit');
      }
      if (key.ctrl && key.name === 'c') {
        cleanup();
        process.exit();
      }
    };

    process.stdin.on('keypress', handleKeypress);

    // Initial print to allocate space
    for (let i = 0; i < carHeight; i++) console.log('');

    const interval = setInterval(() => {
      const minutes = Math.floor(timeLeft / 60);
      const secs = timeLeft % 60;
      const formattedTime = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      const timerText = `   ${chalk.bold.yellow(label)}: ${chalk.white(formattedTime)} `;

      // Move cursor back to top of the block
      process.stdout.write(`\u001b[${carHeight}A`);

      for (let i = 0; i < carHeight; i++) {
        let line = carLines[i] || '';
        // Trim trailing spaces to avoid wrapping issues if terminal is narrow
        const trimmedCarLine = line.replace(/\s+$/, '');
        
        let outputLine = chalk.blue(trimmedCarLine);
        
        if (i === timerLineIndex) {
          outputLine += timerText;
        }
        
        process.stdout.write(`\r\u001b[K${outputLine}\n`);
      }
      
      if (timeLeft <= 0) {
        cleanup();
        resolve('done');
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
