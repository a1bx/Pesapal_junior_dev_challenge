import { Storage } from './Storage.ts';
import { Table } from './Table.ts';
import { TableSchema, Row, QueryResult } from './types.ts';

export class Database {
    private storage: Storage;
    private tables: Map<string, Table> = new Map();

    constructor(dataDir: string) {
        this.storage = new Storage(dataDir);
        this.loadAllTables();
    }

    private loadAllTables() {
        const tableNames = this.storage.listTables();
        tableNames.forEach(name => {
            const data = this.storage.loadTable(name);
            if (data) {
                this.tables.set(name, new Table(data.schema, data.rows));
            }
        });
    }

    createTable(schema: TableSchema): QueryResult {
        if (this.tables.has(schema.name)) {
            return { success: false, message: `Table ${schema.name} already exists` };
        }
        const table = new Table(schema);
        this.tables.set(schema.name, table);
        this.storage.saveTable(schema.name, schema, []);
        return { success: true, message: `Table ${schema.name} created successfully` };
    }

    getTable(name: string): Table | undefined {
        return this.tables.get(name);
    }

    getTableNames(): string[] {
        return Array.from(this.tables.keys());
    }

    dropTable(name: string): QueryResult {
        if (!this.tables.has(name)) {
            return { success: false, message: `Table ${name} does not exist` };
        }
        this.tables.delete(name);
        this.storage.deleteTable(name);
        return { success: true, message: `Table ${name} dropped successfully` };
    }

    saveAll() {
        this.tables.forEach((table, name) => {
            this.storage.saveTable(name, table.schema, table.getRows());
        });
    }
}
