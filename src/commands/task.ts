import chalk from 'chalk';
import { readData, writeData, Task } from '../utils/storage.js';

export function addTask(title: string) {
  const data = readData();
  const newTask: Task = {
    id: data.tasks.length > 0 ? Math.max(...data.tasks.map(t => t.id)) + 1 : 1,
    title,
    isDone: false,
    createdAt: new Date().toISOString(),
  };
  data.tasks.push(newTask);
  writeData(data);
  console.log(chalk.green(`Task added: "${title}"`));
}

export function listTasks() {
  const data = readData();
  const pendingTasks = data.tasks.filter(t => !t.isDone);
  
  if (pendingTasks.length === 0) {
    console.log(chalk.yellow('No pending tasks! Add some with: studyos task add "title"'));
    return;
  }
  
  console.log(chalk.bold.blue('\n--- Pending Tasks ---'));
  pendingTasks.forEach(task => {
    console.log(`${chalk.gray(task.id + '.')} ${task.title}`);
  });
}

export function completeTask(id: number) {
  const data = readData();
  const taskIndex = data.tasks.findIndex(t => t.id === id);
  
  if (taskIndex === -1) {
    console.log(chalk.red(`Task with ID ${id} not found.`));
    return;
  }
  
  data.tasks[taskIndex].isDone = true;
  
  // Log to history
  data.history.push({
    type: 'task',
    timestamp: new Date().toISOString(),
    id: id
  });
  
  writeData(data);
  console.log(chalk.green(`Task marked as done: "${data.tasks[taskIndex].title}"`));
}
