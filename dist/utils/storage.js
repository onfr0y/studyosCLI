import fs from 'fs';
import path from 'path';
import os from 'os';
const STORAGE_PATH = path.join(os.homedir(), '.studyos.json');
const defaultData = {
    tasks: [],
    topics: [],
};
export function readData() {
    if (!fs.existsSync(STORAGE_PATH)) {
        return defaultData;
    }
    try {
        const data = fs.readFileSync(STORAGE_PATH, 'utf-8');
        return JSON.parse(data);
    }
    catch (err) {
        console.error('Error reading study data:', err);
        return defaultData;
    }
}
export function writeData(data) {
    try {
        fs.writeFileSync(STORAGE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    }
    catch (err) {
        console.error('Error writing study data:', err);
    }
}
