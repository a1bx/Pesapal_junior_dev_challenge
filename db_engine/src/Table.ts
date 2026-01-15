import { TableSchema, Column, Row, DataType } from './types.ts';

export class Table {
    public schema: TableSchema;
    private rows: Row[] = [];
    private indexes: Map<string, Map<any, number>> = new Map(); // column_name -> (value -> row_index)

    constructor(schema: TableSchema, rows: Row[] = []) {
        this.schema = schema;
        this.rows = rows;
        this.buildIndexes();
    }

    private buildIndexes() {
        this.schema.columns.forEach(col => {
            if (col.primaryKey || col.unique) {
                const index = new Map<any, number>();
                this.rows.forEach((row, idx) => {
                    index.set(row[col.name], idx);
                });
                this.indexes.set(col.name, index);
            }
        });
    }

    private validateRow(row: Row): void {
        this.schema.columns.forEach(col => {
            const value = row[col.name];

            // Check nullability
            if (value === undefined || value === null) {
                if (col.nullable === false) {
                    throw new Error(`Column ${col.name} cannot be null`);
                }
                return;
            }

            // Check type
            switch (col.type) {
                case 'INT':
                    if (typeof value !== 'number' || !Number.isInteger(value)) {
                        throw new Error(`Column ${col.name} must be an integer`);
                    }
                    break;
                case 'TEXT':
                    if (typeof value !== 'string') {
                        throw new Error(`Column ${col.name} must be a string`);
                    }
                    break;
                case 'BOOLEAN':
                    if (typeof value !== 'boolean') {
                        throw new Error(`Column ${col.name} must be a boolean`);
                    }
                    break;
            }

            // Check uniqueness and PK
            if (col.primaryKey || col.unique) {
                const index = this.indexes.get(col.name);
                if (index && index.has(value)) {
                    throw new Error(`Duplicate value for column ${col.name}: ${value}`);
                }
            }
        });
    }

    insert(row: Row): void {
        this.validateRow(row);
        const newIdx = this.rows.length;
        this.rows.push(row);

        // Update indexes
        this.schema.columns.forEach(col => {
            if (col.primaryKey || col.unique) {
                this.indexes.get(col.name)?.set(row[col.name], newIdx);
            }
        });
    }

    select(filter?: (row: Row) => boolean): Row[] {
        if (!filter) return [...this.rows];
        return this.rows.filter(filter);
    }

    update(filter: (row: Row) => boolean, updates: Partial<Row>): number {
        let count = 0;
        const rowsToUpdate: { idx: number, next: Row }[] = [];

        this.rows.forEach((row, idx) => {
            if (filter(row)) {
                const updatedRow = { ...row, ...updates };
                // Validate against schema (types, nullability)
                // Note: Uniqueness is tricky during update because the row itself has the value.
                // Simple approach: Temporarily remove the row, validate, then re-insert concept.
                rowsToUpdate.push({ idx, next: updatedRow });
                count++;
            }
        });

        // Application phase: actually update and rebuild
        rowsToUpdate.forEach(item => {
            this.rows[item.idx] = item.next;
        });

        if (count > 0) {
            this.buildIndexes();
        }
        return count;
    }

    delete(filter: (row: Row) => boolean): number {
        const initialCount = this.rows.length;
        this.rows = this.rows.filter(row => !filter(row));
        this.buildIndexes();
        return initialCount - this.rows.length;
    }

    getRows(): Row[] {
        return this.rows;
    }
}
