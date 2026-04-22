import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { readData } from '../utils/storage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function showDashboard() {
  const data = readData();
  const now = new Date();

  // Read car ASCII art
  let carArt = '';
  try {
    const carPath = path.join(__dirname, '../utils/car.txt');
    carArt = fs.readFileSync(carPath, 'utf-8');
  } catch (err) {
    // Fallback if file not found
    carArt = '';
  }

  console.clear();
  if (carArt) {
    console.log(chalk.cyan(carArt));
  }
  console.log(chalk.bold.cyan('===================================================='));
  console.log(chalk.bold.white('                📚 MY STUDY OS DASHBOARD             '));
  console.log(chalk.bold.cyan('===================================================='));

  // 1. Pomodoro Section (Quick Status)
  console.log(chalk.bold.yellow('\n[ 🍅 POMODORO STATUS ]'));
  console.log(chalk.white(' Ready to start a 50/10 session. Run: ') + chalk.cyan('studyos pomodoro'));

  // 2. Task Tracker Section
  console.log(chalk.bold.magenta('\n[ ✅ PENDING TASKS ]'));
  const pendingTasks = data.tasks.filter(t => !t.isDone);
  if (pendingTasks.length === 0) {
    console.log(chalk.gray('  No pending tasks. Use ') + chalk.cyan('studyos task add "title"'));
  } else {
    pendingTasks.slice(0, 5).forEach(task => {
      console.log(chalk.white(`  • [${task.id}] ${task.title}`));
    });
    if (pendingTasks.length > 5) console.log(chalk.gray(`  ... and ${pendingTasks.length - 5} more.`));
  }

  // 3. SRS Section
  console.log(chalk.bold.blue('\n[ 🧠 SPACED REPETITION (SRS) ]'));
  const dueTopics = data.topics.filter(t => new Date(t.nextReviewDate) <= now);
  const upComing = data.topics.filter(t => new Date(t.nextReviewDate) > now);

  if (dueTopics.length > 0) {
    console.log(chalk.red(`  🔥 ${dueTopics.length} topics are DUE for review!`) + chalk.white(' Run: ') + chalk.cyan('studyos srs review'));
  } else {
    console.log(chalk.green('  ✅ You are caught up on all reviews!'));
  }

  if (upComing.length > 0) {
    const nextTopic = upComing.sort((a, b) => new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime())[0];
    console.log(chalk.gray(`  Next review: ${nextTopic.title} on ${new Date(nextTopic.nextReviewDate).toLocaleDateString()}`));
  }

  console.log(chalk.bold.cyan('\n===================================================='));
  console.log(chalk.gray(' Use --help to see all commands. | Stay focused! '));
  console.log(chalk.bold.cyan('====================================================\n'));
}
