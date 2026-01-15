import * as fs from 'fs';
import * as path from 'path';
import { TableSchema, Row } from './types.ts';

export class Storage {
    private dataDir: string;

    constructor(dataDir: string) {
        this.dataDir = dataDir;
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
    }

    private getTablePath(tableName: string): string {
        return path.join(this.dataDir, `${tableName}.json`);
    }

    saveTable(tableName: string, schema: TableSchema, rows: Row[]): void {
        const filePath = this.getTablePath(tableName);
        const data = JSON.stringify({ schema, rows }, null, 2);
        fs.writeFileSync(filePath, data, 'utf8');
    }

    loadTable(tableName: string): { schema: TableSchema; rows: Row[] } | null {
        const filePath = this.getTablePath(tableName);
        if (!fs.existsSync(filePath)) {
            return null;
        }
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    }

    listTables(): string[] {
        return fs.readdirSync(this.dataDir)
            .filter(file => file.endsWith('.json'))
            .map(file => file.replace('.json', ''));
    }

    deleteTable(tableName: string): void {
        const filePath = this.getTablePath(tableName);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
}
