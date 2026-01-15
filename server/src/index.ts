import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Database } from '../../db_engine/src/Database.ts';
import { QueryExecutor } from '../../db_engine/src/QueryExecutor.ts';
import path from 'path';

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

// Initialize Database
const dbPath = path.resolve('../data');
const db = new Database(dbPath);
const executor = new QueryExecutor(db);

// Endpoints
app.post('/api/query', (req, res) => {
    const { query } = req.body;
    if (!query) {
        return res.status(400).json({ success: false, message: 'No query provided' });
    }

    try {
        const result = executor.execute(query);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Helper for Student list
app.get('/api/students', (req, res) => {
    const result = executor.execute('SELECT * FROM Students');
    res.json(result);
});

// Helper for Course list
app.get('/api/courses', (req, res) => {
    const result = executor.execute('SELECT * FROM Courses');
    res.json(result);
});

// Helper for Enrollments with JOIN
app.get('/api/enrollments', (req, res) => {
    const query = 'SELECT Students.name, Courses.title FROM Students JOIN Enrollments ON Students.id=Enrollments.student_id JOIN Courses ON Enrollments.course_id=Courses.id';
    const result = executor.execute(query);
    res.json(result);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
