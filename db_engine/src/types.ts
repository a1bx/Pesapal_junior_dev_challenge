export type DataType = 'INT' | 'TEXT' | 'BOOLEAN';

export interface Column {
    name: string;
    type: DataType;
    primaryKey?: boolean;
    unique?: boolean;
    nullable?: boolean;
}

export interface Row {
    [columnName: string]: any;
}

export interface TableSchema {
    name: string;
    columns: Column[];
}

export interface QueryResult {
    success: boolean;
    message?: string;
    data?: Row[];
    affectedRows?: number;
}
