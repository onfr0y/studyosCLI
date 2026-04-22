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

  // 0. Production Stats (New!)
  console.log(chalk.bold.green('\n[ 🚀 PRODUCTION STATS - TODAY ]'));
  const today = now.toISOString().split('T')[0];
  const todayHistory = data.history.filter(h => h.timestamp.startsWith(today));
  
  const workSessions = todayHistory.filter(h => h.type === 'work');
  const breakSessions = todayHistory.filter(h => h.type === 'break');
  const tasksDone = todayHistory.filter(h => h.type === 'task');
  const totalWorkMinutes = workSessions.reduce((sum, h) => sum + (h.duration || 0), 0);

  const hours = Math.floor(totalWorkMinutes / 60);
  const mins = totalWorkMinutes % 60;
  
  console.log(chalk.white(`  ⏱️  Study Time: `) + chalk.bold.green(`${hours}h ${mins}m`));
  console.log(chalk.white(`  🎯 Focus Sessions: `) + chalk.bold.yellow(`${workSessions.length}`));
  console.log(chalk.white(`  ✅ Tasks Finished: `) + chalk.bold.magenta(`${tasksDone.length}`));

  // Simple progress bar for a 4-hour daily goal (240 mins)
  const goalMinutes = 240; 
  const progress = Math.min(totalWorkMinutes / goalMinutes, 1);
  const barWidth = 30;
  const filledWidth = Math.round(progress * barWidth);
  const emptyWidth = barWidth - filledWidth;
  const progressBar = chalk.green('█'.repeat(filledWidth)) + chalk.gray('░'.repeat(emptyWidth));
  console.log(chalk.white(`  📊 Daily Goal: [${progressBar}] ${Math.round(progress * 100)}%`));

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
