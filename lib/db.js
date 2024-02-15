import sqlite3 from 'sqlite3';

const sqlite = sqlite3.verbose();
const db = new sqlite.Database("./fpq.sqlite", sqlite.OPEN_READWRITE, (err) => {
    if (err) return console.log(err);
});

export default db;