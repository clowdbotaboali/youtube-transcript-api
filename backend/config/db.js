import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, '..', 'database.json');

class Database {
  constructor() {
    this.init();
  }

  init() {
    if (!existsSync(DB_PATH)) {
      this.write({ history: [] });
    }
  }

  read() {
    try {
      const data = readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return { history: [] };
    }
  }

  write(data) {
    writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  }

  insert(item) {
    const data = this.read();
    const id = data.history.length > 0 ? Math.max(...data.history.map(h => h.id)) + 1 : 1;
    const newItem = {
      id,
      ...item,
      created_at: new Date().toISOString()
    };
    data.history.push(newItem);
    this.write(data);
    return id;
  }

  getAll() {
    const data = this.read();
    return data.history.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  getById(id) {
    const data = this.read();
    return data.history.find(item => item.id === parseInt(id));
  }

  delete(id) {
    const data = this.read();
    const initialLength = data.history.length;
    data.history = data.history.filter(item => item.id !== parseInt(id));
    this.write(data);
    return data.history.length < initialLength;
  }
}

const db = new Database();
export default db;
