import express from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config'
import invoicesRoutes from "./routes/invoices.js";
import db from './lib/db.js'

const app = express();

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email VARCHAR(225), password VARCHAR(225), role VARCHAR(225))");
    db.run("CREATE TABLE IF NOT EXISTS invoices(id VARCHAR(225) PRIMARY KEY, email VARCHAR(225), status VARCHAR(225), priority VARCHAR(225))");
    db.run("CREATE TABLE IF NOT EXISTS images(id INTEGER PRIMARY KEY, title VARCHAR(225), invoice_id VARCHAR(225), invoice_status VARCHAR(225), FOREIGN KEY (invoice_id) REFERENCES invoices(id), FOREIGN KEY (invoice_status) REFERENCES invoices(status))");
});

app.use(bodyParser.json());

app.use('/invoices', invoicesRoutes);

app.get('/', (req, res) => {
    res.send()
})

app.post('/login', (req, res) => {
    const email = req.body.email
    console.log(email)

    try {
        db.get(`SELECT * FROM users WHERE email = '${email}'`, async (err, row) => {
            if (err) return res.status(500).json({ success: false, error: err })
            if (row === undefined) return res.status(401).json({ success: false, message: 'User tidak ditemukan' })

            if (await bcrypt.compare(req.body.password, row.password)) {
                const accessToken = jwt.sign({ email: row.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 10 })
                return res.status(200).json({ success: true, message: 'Berhasil login', accessToken: accessToken, user: { email: row.email } })
            } else {
                return res.status(401).json({ success: false, message: 'Email atau password salah' })
            }
        })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: err });
    }
});

app.post('/register', (req, res) => {
    const { email, password } = req.body

    try {
        db.get('SELECT * FROM users', async (err, row) => {
            if (err) return res.status(500).json({ success: false })
            if (row !== undefined) return res.status(403).json({ success: false, message: 'Not allowed' })
    
            const hashedPassword = await bcrypt.hash(password, 10)
            
            db.run(`INSERT INTO users (email, password) VALUES (?,?)`, 
                [ email, hashedPassword], (err) => {
                    if (err) return res.status(401).json({ success: false })
                    return res.status(201).json({ success: true, message: 'user registered!' })
            })
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: err });
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port http://localhost:${process.env.PORT}`);
});