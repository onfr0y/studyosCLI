import chalk from 'chalk';
import inquirer from 'inquirer';
import { readData, writeData } from '../utils/storage.js';
const INTERVALS = [1, 3, 7, 14, 30, 90];
export function addTopic(title) {
    const data = readData();
    const newTopic = {
        id: data.topics.length > 0 ? Math.max(...data.topics.map(t => t.id)) + 1 : 1,
        title,
        intervalLevel: 0,
        nextReviewDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
    };
    data.topics.push(newTopic);
    writeData(data);
    console.log(chalk.green(`Topic added for SRS: "${title}"`));
    console.log(chalk.yellow(`First review is due now!`));
}
export async function reviewTopics() {
    const data = readData();
    const now = new Date();
    const dueTopics = data.topics.filter(t => new Date(t.nextReviewDate) <= now);
    if (dueTopics.length === 0) {
        console.log(chalk.green('Great job! No topics due for review today.'));
        return;
    }
    console.log(chalk.bold.blue(`\n--- Reviewing ${dueTopics.length} Topics ---`));
    for (const topic of dueTopics) {
        const { remembered } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'remembered',
                message: `Topic: ${chalk.cyan(topic.title)}\nDid you remember this topic correctly?`,
                default: true,
            },
        ]);
        const topicIndex = data.topics.findIndex(t => t.id === topic.id);
        if (remembered) {
            const nextLevel = Math.min(topic.intervalLevel + 1, INTERVALS.length - 1);
            const nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + INTERVALS[topic.intervalLevel]);
            data.topics[topicIndex].intervalLevel = nextLevel;
            data.topics[topicIndex].nextReviewDate = nextDate.toISOString();
            console.log(chalk.green(`Excellent! Next review in ${INTERVALS[topic.intervalLevel]} days.`));
        }
        else {
            data.topics[topicIndex].intervalLevel = 0;
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            data.topics[topicIndex].nextReviewDate = tomorrow.toISOString();
            console.log(chalk.red(`Got it. We'll review this again tomorrow.`));
        }
        console.log('---');
    }
    writeData(data);
    console.log(chalk.bold.green('All done for today!'));
}
export function listSrsStatus() {
    const data = readData();
    if (data.topics.length === 0) {
        console.log(chalk.yellow('No SRS topics found. Add one with: studyos srs add "topic"'));
        return;
    }
    console.log(chalk.bold.blue('\n--- SRS Status ---'));
    const now = new Date();
    data.topics.sort((a, b) => new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime()).forEach(topic => {
        const nextDate = new Date(topic.nextReviewDate);
        const isDue = nextDate <= now;
        const dateStr = nextDate.toLocaleDateString();
        console.log(`${chalk.gray(topic.id + '.')} ${topic.title} | Level: ${topic.intervalLevel} | Next: ${isDue ? chalk.red(dateStr + ' (DUE)') : chalk.green(dateStr)}`);
    });
}
