import { Router } from "express"
import randomize from "randomatic"
import authToken from '../lib/auth.js'
import db from '../lib/db.js'

const router = Router()

router.get('/', (req, res) => {
	try {
		db.all(`SELECT * FROM invoices`, [], (err, rows) => {
			if (err) return res.status(500).json({ success: false, error: err });
			if (rows.length < 1) return res.status(200).json({ success: true, message: "Empty data" });
			
			return res.status(200).json({ success: true, data: rows });
		})
	} catch (error) {
        console.error(err);
        return res.status(500).json({ success: false, error: err });
	}
});

router.post('/', (req, res) => {
    const { email, status, priority } = req.body
    const id = randomize('A0', 16)

	try {
		db.run(`INSERT INTO invoices(id, email, status, priority) VALUES (?,?,?,?)`,
            [ id, email, status, priority ], (err) => {
                if (err) return res.status(500).json({ success: false, error: err })
		})
		return res.status(200).json({ success: true })
	} catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: err });
	}
});

router.put('/:invoicesId', authToken, (req, res) => {
    const { status, priority, imageTitle } = req.body;
    const id = req.params.invoicesId;

    try {
        db.serialize(() => {
            db.run(`UPDATE invoices SET status = ?, priority = ? WHERE id = ?`, 
                [status, priority, id], (err) => {
                    if (err) {
                        console.error(err);
                        return res.json({ status: 500, success: false, error: err, message: 'update status' });
                    }
            });
            db.get(`SELECT * FROM images WHERE invoice_id = '${id}' AND invoice_status = '${status}'`, 
                (err, row) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ success: false, error: err, message: 'select error' });
                    }

                    if (row === undefined) {
                        db.run(`INSERT INTO images (title, invoice_id, invoice_status) VALUES (?,?,?)`,
                            [ imageTitle, id, status], (err) => {
                                if (err) {
                                    console.error(err);
                                    return res.status(500).json({ success: false, error: err, message: 'select undefined' });
                                }
                                return res.status(200).json({success: true});
                        });
                    } else {
                        db.run(`UPDATE images SET title = ? WHERE invoice_id = ? AND invoice_status = ?`,
                            [ imageTitle, id, status], (err) => {
                                if (err) {
                                    console.error(err);
                                    return res.status(500).json({ success: false, error: err, message: 'update images' });
                                }
                                return res.status(200).json({success: true});
                        });
                    }
            });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: error, message: 'catch' });
    }
});

export default router