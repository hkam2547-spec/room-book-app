const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let db;

async function setupDatabase() {
    db = await open({ filename: './database.sqlite', driver: sqlite3.Database });

    // สร้างตาราง 2 อัน: ห้องเรียน (rooms) และ รายการจอง (bookings)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS rooms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            roomId INTEGER,
            studentName TEXT,
            usageDate TEXT,
            startTime TEXT,
            endTime TEXT,
            conditionStatus TEXT,
            conditionRemark TEXT
        );
    `);

    // ใส่ข้อมูลห้องพื้นฐาน
    const row = await db.get('SELECT COUNT(*) as count FROM rooms');
    if (row.count === 0) {
        await db.exec(`INSERT INTO rooms (name) VALUES ('ห้องคอม232'), ('ห้องคอม228'), ('ห้องคอม 237'), ('ห้องศาสตร์พระราชา')`);
    }
}
setupDatabase();

// API: ดึงข้อมูลห้องและการจองทั้งหมด
app.get('/api/data', async (req, res) => {
    const rooms = await db.all('SELECT * FROM rooms');
    const bookings = await db.all(`
        SELECT b.*, r.name as roomName 
        FROM bookings b 
        JOIN rooms r ON b.roomId = r.id 
        ORDER BY b.usageDate DESC, b.startTime ASC
    `);
    res.json({ rooms, bookings });
});

// API: จองห้อง (พร้อมเช็กเวลาทับซ้อน)
app.post('/api/book', async (req, res) => {
    const { roomId, studentName, usageDate, startTime, endTime } = req.body;
    
    if (startTime >= endTime) {
        return res.status(400).json({ success: false, message: 'เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มครับ' });
    }

    // ตรรกะเช็กเวลาทับซ้อน: (เวลาเริ่มใหม่ < เวลาจบเดิม) และ (เวลาจบใหม่ > เวลาเริ่มเดิม)
    const conflicts = await db.all(`
        SELECT * FROM bookings 
        WHERE roomId = ? AND usageDate = ? 
        AND (? < endTime AND ? > startTime)
    `, [roomId, usageDate, startTime, endTime]);

    if (conflicts.length > 0) {
        return res.status(400).json({ success: false, message: 'เวลานี้มีการจองไปแล้วครับ กรุณาเลือกเวลาอื่น' });
    }

    await db.run(
        'INSERT INTO bookings (roomId, studentName, usageDate, startTime, endTime) VALUES (?, ?, ?, ?, ?)', 
        [roomId, studentName, usageDate, startTime, endTime]
    );
    res.json({ success: true, message: 'จองห้องสำเร็จ!' });
});

// API: รายงานคืนห้อง
app.post('/api/return', async (req, res) => {
    const { bookingId, conditionStatus, conditionRemark } = req.body;
    await db.run(
        'UPDATE bookings SET conditionStatus = ?, conditionRemark = ? WHERE id = ?', 
        [conditionStatus, conditionRemark, bookingId]
    );
    res.json({ success: true, message: 'บันทึกรายงานสำเร็จ' });
});

app.listen(3000, () => console.log('Server is running on http://localhost:3000'));