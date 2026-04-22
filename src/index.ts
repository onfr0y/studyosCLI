#!/usr/bin/env node
import { Command } from 'commander';
import { startPomodoro, editPomodoroSettings } from './commands/pomodoro.js';
import { addTask, listTasks, completeTask } from './commands/task.js';
import { addTopic, reviewTopics, listSrsStatus } from './commands/srs.js';
import { showDashboard } from './commands/dashboard.js';

const program = new Command();

program
  .name('studyos')
  .description('A distraction-free Study OS CLI for focus and long-term learning')
  .version('1.1.0')
  .action(() => {
    showDashboard();
  });

// Dashboard Command
program
  .command('dashboard')
  .description('Show the study dashboard')
  .action(() => {
    showDashboard();
  });

// Pomodoro Command
const pomodoro = program
  .command('pomodoro')
  .description('Manage Pomodoro timer')
  .action(() => {
    startPomodoro();
  });

pomodoro
  .command('set <work> <break>')
  .description('Set Pomodoro work and break minutes')
  .action((work, breakTime) => {
    editPomodoroSettings(work, breakTime);
  });

// Task Commands
const task = program.command('task').description('Manage study tasks');

task
  .command('add <title>')
  .description('Add a new study task')
  .action((title) => {
    addTask(title);
  });

task
  .command('list')
  .description('List all pending study tasks')
  .action(() => {
    listTasks();
  });

task
  .command('done <id>')
  .description('Mark a task as completed')
  .action((id) => {
    completeTask(parseInt(id));
  });

// SRS Commands
const srs = program.command('srs').description('Spaced Repetition System');

srs
  .command('add <topic>')
  .description('Add a new topic for review')
  .action((topic) => {
    addTopic(topic);
  });

srs
  .command('review')
  .description('Review topics due today')
  .action(() => {
    reviewTopics();
  });

srs
  .command('status')
  .description('Show status of all SRS topics')
  .action(() => {
    listSrsStatus();
  });

program.parse(process.argv);
