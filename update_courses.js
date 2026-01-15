import fs from 'fs';

const path = 'data/Courses.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Update schema
if (!data.schema.columns.find(c => c.name === 'capacity')) {
    data.schema.columns.push({
        name: 'capacity',
        type: 'INT',
        primaryKey: false,
        unique: false,
        nullable: true
    });
}

// Update rows
data.rows = data.rows.map(row => ({
    ...row,
    capacity: row.capacity || 2 // Set low capacity to test the "full" logic
}));

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Courses table updated with capacity.');
