import { Database } from './Database.ts';
import { QueryResult, Column, DataType, Row } from './types.ts';

export class QueryExecutor {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    execute(query: string): QueryResult {
        const trimmedQuery = query.trim();
        const upperQuery = trimmedQuery.toUpperCase();
        if (upperQuery.startsWith('CREATE TABLE')) {
            return this.handleCreate(trimmedQuery);
        } else if (upperQuery.startsWith('INSERT INTO')) {
            return this.handleInsert(trimmedQuery);
        } else if (upperQuery.startsWith('SELECT')) {
            return this.handleSelect(trimmedQuery);
        } else if (upperQuery.startsWith('UPDATE')) {
            return this.handleUpdate(trimmedQuery);
        } else if (upperQuery.startsWith('DELETE FROM')) {
            return this.handleDelete(trimmedQuery);
        } else if (upperQuery.startsWith('DROP TABLE')) {
            return this.handleDrop(trimmedQuery);
        } else if (upperQuery === 'SHOW TABLES') {
            const tables = this.db.getTableNames();
            return { success: true, message: `Tables: ${tables.join(', ')}` };
        }

        return { success: false, message: 'Unsupported query or syntax error' };
    }

    private handleCreate(query: string): QueryResult {
        const match = query.match(/CREATE TABLE (\w+) \((.*)\)/i);
        if (!match) return { success: false, message: 'Invalid CREATE TABLE syntax' };

        const tableName = match[1];
        const columnsStr = match[2];
        const columns: Column[] = columnsStr.split(',').map(col => {
            const parts = col.trim().split(/\s+/);
            const name = parts[0];
            const type = parts[1].toUpperCase() as DataType;
            const isPk = col.toUpperCase().includes('PRIMARY KEY');
            const isUnique = col.toUpperCase().includes('UNIQUE');
            return { name, type, primaryKey: isPk, unique: isUnique, nullable: !isPk };
        });

        const result = this.db.createTable({ name: tableName, columns });
        if (result.success) this.db.saveAll();
        return result;
    }

    private handleInsert(query: string): QueryResult {
        const match = query.match(/INSERT INTO (\w+)\s*(\((.*?)\))?\s*VALUES\s*\((.*?)\)/i);
        if (!match) return { success: false, message: 'Invalid INSERT syntax' };

        const tableName = match[1];
        const specifiedColumns = match[3] ? match[3].split(',').map(c => c.trim()) : null;
        const valuesStr = match[4];
        const values = valuesStr.split(',').map(v => {
            const trimmed = v.trim();
            if (trimmed.startsWith("'") && trimmed.endsWith("'")) return trimmed.slice(1, -1);
            if (trimmed.toUpperCase() === 'TRUE') return true;
            if (trimmed.toUpperCase() === 'FALSE') return false;
            if (!isNaN(Number(trimmed))) return Number(trimmed);
            return trimmed;
        });

        const table = this.db.getTable(tableName);
        if (!table) return { success: false, message: `Table ${tableName} not found` };

        const row: Row = {};
        if (specifiedColumns) {
            specifiedColumns.forEach((col, idx) => {
                row[col] = values[idx];
            });
        } else {
            table.schema.columns.forEach((col, idx) => {
                row[col.name] = values[idx];
            });
        }

        try {
            table.insert(row);
            this.db.saveAll();
            return { success: true, message: 'Row inserted successfully' };
        } catch (e: any) {
            return { success: false, message: e.message };
        }
    }

    private handleSelect(query: string): QueryResult {
        const isJoin = query.toUpperCase().includes('JOIN');
        if (isJoin) {
            return this.handleJoinSelect(query);
        }
        return this.handleComplexSelect(query);
    }

    private handleJoinSelect(query: string): QueryResult {
        const parts = query.split(/\s+/);
        const selectIdx = parts.findIndex(p => p.toUpperCase() === 'SELECT');
        const fromIdx = parts.findIndex(p => p.toUpperCase() === 'FROM');

        if (fromIdx === -1) return { success: false, message: 'Invalid SELECT syntax' };

        const selectCols = parts.slice(selectIdx + 1, fromIdx).join('').split(',');
        const table1Name = parts[fromIdx + 1];
        const table1 = this.db.getTable(table1Name);
        if (!table1) return { success: false, message: `Table ${table1Name} not found` };

        let resultRows = table1.getRows().map(r => {
            const newRow: Row = {};
            Object.keys(r).forEach(k => newRow[`${table1Name}.${k}`] = r[k]);
            return newRow;
        });

        let currentIdx = fromIdx + 2;
        while (currentIdx < parts.length && parts[currentIdx].toUpperCase() === 'JOIN') {
            const table2Name = parts[currentIdx + 1];
            const onIdx = parts.findIndex((p, i) => i > currentIdx && p.toUpperCase() === 'ON');
            if (onIdx === -1 || !parts[onIdx + 1]) return { success: false, message: 'Invalid JOIN syntax' };

            const condition = parts[onIdx + 1];
            const [left, right] = condition.split('=');
            if (!left || !right) return { success: false, message: 'Invalid JOIN condition' };

            const table2 = this.db.getTable(table2Name);
            if (!table2) return { success: false, message: `Table ${table2Name} not found` };

            const table2Rows = table2.getRows();
            const nextResults: Row[] = [];

            resultRows.forEach(r1 => {
                table2Rows.forEach(r2 => {
                    const r1Val = left.includes('.') ? r1[left] : r1[`${table1Name}.${left}`];
                    const r2Col = right.includes('.') ? right.split('.')[1] : right;
                    if (!r2Col) return;
                    const r2Val = r2[r2Col];

                    if (r1Val == r2Val) {
                        const mergedRow = { ...r1 };
                        Object.keys(r2).forEach(k => mergedRow[`${table2Name}.${k}`] = r2[k]);
                        nextResults.push(mergedRow);
                    }
                });
            });

            resultRows = nextResults;
            currentIdx = onIdx + 2;
        }

        if (selectCols[0] !== '*') {
            resultRows = resultRows.map(r => {
                const newRow: Row = {};
                selectCols.forEach(c => {
                    const cleaned = c.trim();
                    newRow[cleaned] = r[cleaned];
                });
                return newRow;
            });
        }

        return { success: true, data: resultRows };
    }

    private handleComplexSelect(query: string): QueryResult {
        const basicMatch = query.match(/SELECT (.*?) FROM (\w+)(?:\s+WHERE (.*))?/i);
        if (!basicMatch) return { success: false, message: 'Invalid SELECT syntax' };

        const selectCols = basicMatch[1].trim();
        const tableName = basicMatch[2].trim();
        const whereClause = basicMatch[3];

        const table = this.db.getTable(tableName);
        if (!table) return { success: false, message: `Table ${tableName} not found` };

        let rows = table.select();

        if (whereClause) {
            const whereMatch = whereClause.match(/(\w+)\s*=\s*(.*)/);
            if (whereMatch) {
                const col = whereMatch[1];
                let val: any = whereMatch[2].trim();
                if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
                else if (!isNaN(Number(val))) val = Number(val);

                rows = rows.filter(r => r[col] == val);
            }
        }

        if (selectCols !== '*') {
            const cols = selectCols.split(',').map(c => c.trim());
            rows = rows.map(r => {
                const newRow: Row = {};
                cols.forEach(c => newRow[c] = r[c]);
                return newRow;
            });
        }

        return { success: true, data: rows };
    }

    private handleUpdate(query: string): QueryResult {
        const match = query.match(/UPDATE (\w+) SET (\w+)\s*=\s*(.*?)(?:\s+WHERE (.*))?/i);
        if (!match) return { success: false, message: 'Invalid UPDATE syntax' };

        const tableName = match[1];
        const setCol = match[2];
        let setVal: any = match[3].trim();
        if (setVal.startsWith("'") && setVal.endsWith("'")) setVal = setVal.slice(1, -1);
        else if (!isNaN(Number(setVal))) setVal = Number(setVal);

        const whereClause = match[4];
        const table = this.db.getTable(tableName);
        if (!table) return { success: false, message: `Table ${tableName} not found` };

        let filter = (r: Row) => true;
        if (whereClause) {
            const whereMatch = whereClause.match(/(\w+)\s*=\s*(.*)/);
            if (whereMatch) {
                const col = whereMatch[1];
                let val: any = whereMatch[2].trim();
                if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
                else if (!isNaN(Number(val))) val = Number(val);
                filter = (r: Row) => r[col] == val;
            }
        }

        const affected = table.update(filter, { [setCol]: setVal });
        this.db.saveAll();
        return { success: true, message: `Updated ${affected} rows` };
    }

    private handleDelete(query: string): QueryResult {
        const match = query.match(/DELETE FROM (\w+)(?:\s+WHERE (.*))?/i);
        if (!match) return { success: false, message: 'Invalid DELETE syntax' };

        const tableName = match[1];
        const whereClause = match[2];
        const table = this.db.getTable(tableName);
        if (!table) return { success: false, message: `Table ${tableName} not found` };

        let filter = (r: Row) => true;
        if (whereClause) {
            const whereMatch = whereClause.match(/(\w+)\s*=\s*(.*)/);
            if (whereMatch) {
                const col = whereMatch[1];
                let val: any = whereMatch[2].trim();
                if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
                else if (!isNaN(Number(val))) val = Number(val);
                filter = (r: Row) => r[col] == val;
            }
        }

        const affected = table.delete(filter);
        this.db.saveAll();
        return { success: true, message: `Deleted ${affected} rows` };
    }

    private handleDrop(query: string): QueryResult {
        const match = query.match(/DROP TABLE (\w+)/i);
        if (!match) return { success: false, message: 'Invalid DROP syntax' };
        return this.db.dropTable(match[1]);
    }
}
