import fs from 'fs';
import path from 'path';
import os from 'os';

const STORAGE_PATH = path.join(os.homedir(), '.studyos.json');

export interface Task {
  id: number;
  title: string;
  isDone: boolean;
  createdAt: string;
}

export interface Topic {
  id: number;
  title: string;
  intervalLevel: number; // 0 to 5
  nextReviewDate: string; // ISO string
  createdAt: string;
}

export interface PomodoroSettings {
  workMinutes: number;
  breakMinutes: number;
}

export interface HistoryEntry {
  type: 'work' | 'break' | 'task';
  timestamp: string;
  duration?: number; // in minutes
  id?: number; // taskId or sessionCount
}

export interface StudyData {
  tasks: Task[];
  topics: Topic[];
  pomodoroSettings: PomodoroSettings;
  history: HistoryEntry[];
}

const defaultData: StudyData = {
  tasks: [],
  topics: [],
  pomodoroSettings: {
    workMinutes: 50,
    breakMinutes: 10,
  },
  history: [],
};

export function readData(): StudyData {
  if (!fs.existsSync(STORAGE_PATH)) {
    return defaultData;
  }
  try {
    const data = fs.readFileSync(STORAGE_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    return {
      ...defaultData,
      ...parsed,
      pomodoroSettings: {
        ...defaultData.pomodoroSettings,
        ...(parsed.pomodoroSettings || {}),
      },
      history: parsed.history || [],
    };
  } catch (err) {
    console.error('Error reading study data:', err);
    return defaultData;
  }
}

export function writeData(data: StudyData): void {
  try {
    fs.writeFileSync(STORAGE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing study data:', err);
  }
}
