import * as readline from 'readline';
import { Database } from './Database.ts';
import { QueryExecutor } from './QueryExecutor.ts';

const db = new Database('../data');
const executor = new QueryExecutor(db);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'nexus-db> '
});

console.log('--- Nexus DB REPL ---');
console.log('Type your SQL queries below. Type "exit" to quit.');
rl.prompt();

rl.on('line', (line) => {
    const query = line.trim();
    if (query.toLowerCase() === 'exit') {
        rl.close();
        return;
    }

    if (query) {
        try {
            const result = executor.execute(query);
            if (result.success) {
                if (result.data) {
                    console.table(result.data);
                } else {
                    console.log(result.message);
                }
            } else {
                console.error(`Error: ${result.message}`);
            }
        } catch (e: any) {
            console.error(`Unexpected Error: ${e.message}`);
        }
    }
    rl.prompt();
}).on('close', () => {
    console.log('Goodbye!');
    process.exit(0);
});
