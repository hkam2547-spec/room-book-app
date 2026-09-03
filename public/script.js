// ช่วงเวลาเรียนทั้งหมด (คาบ 1-10)
const allTimeSlots = [
    "08.30-09.20", "09.20-10.10", "10.10-11.00", "11.00-11.50", 
    "11.50-12.40", "12.40-13.30", "13.30-14.20", "14.20-15.10", 
    "15.10-16.00", "16.00-16.50"
];

// ตารางเวลาที่ไม่ว่างของแต่ละห้อง (คาบเรียนปกติ)
const scheduleData = {
    "228": {
        "Monday": ["08.30-09.20", "09.20-10.10", "10.10-11.00", "11.00-11.50", "11.50-12.40", "12.40-13.30", "13.30-14.20", "14.20-15.10"],
        "Tuesday": ["08.30-09.20", "09.20-10.10", "10.10-11.00", "11.00-11.50", "13.30-14.20", "14.20-15.10"],
        "Wednesday": ["08.30-09.20", "09.20-10.10", "10.10-11.00", "11.00-11.50", "11.50-12.40", "12.40-13.30", "13.30-14.20", "14.20-15.10"],
        "Thursday": ["08.30-09.20", "09.20-10.10", "10.10-11.00", "11.00-11.50", "11.50-12.40", "12.40-13.30", "13.30-14.20", "14.20-15.10"],
        "Friday": ["08.30-09.20", "09.20-10.10", "11.50-12.40", "12.40-13.30"]
    },
    "232": {
        "Monday": ["08.30-09.20", "09.20-10.10", "10.10-11.00", "11.00-11.50", "11.50-12.40", "12.40-13.30", "13.30-14.20", "14.20-15.10"],
        "Tuesday": ["08.30-09.20", "09.20-10.10", "10.10-11.00", "11.00-11.50", "11.50-12.40", "12.40-13.30", "13.30-14.20", "14.20-15.10"],
        "Wednesday": ["08.30-09.20", "09.20-10.10", "10.10-11.00", "11.00-11.50", "11.50-12.40", "12.40-13.30"],
        "Thursday": ["08.30-09.20", "09.20-10.10"],
        "Friday": ["08.30-09.20", "09.20-10.10", "11.00-11.50", "11.50-12.40", "12.40-13.30", "14.20-15.10"]
    },
    "233": {
        "Monday": ["08.30-09.20", "09.20-10.10", "10.10-11.00", "11.00-11.50", "11.50-12.40", "12.40-13.30", "13.30-14.20", "14.20-15.10"],
        "Tuesday": ["08.30-09.20", "09.20-10.10", "10.10-11.00", "11.00-11.50", "11.50-12.40", "12.40-13.30", "13.30-14.20", "14.20-15.10"],
        "Wednesday": ["08.30-09.20", "09.20-10.10", "10.10-11.00", "11.00-11.50", "11.50-12.40", "12.40-13.30"],
        "Thursday": ["08.30-09.20", "09.20-10.10", "10.10-11.00", "11.00-11.50", "11.50-12.40", "12.40-13.30"],
        "Friday": ["08.30-09.20", "09.20-10.10", "10.10-11.00", "11.00-11.50"]
    },
    "237": {
        "Monday": ["08.30-09.20", "09.20-10.10", "10.10-11.00", "11.00-11.50", "11.50-12.40", "12.40-13.30", "13.30-14.20", "14.20-15.10"],
        "Tuesday": ["08.30-09.20", "09.20-10.10", "10.10-11.00", "11.00-11.50", "11.50-12.40", "12.40-13.30", "13.30-14.20", "14.20-15.10"],
        "Wednesday": ["08.30-09.20", "09.20-10.10", "10.10-11.00", "11.00-11.50", "11.50-12.40", "12.40-13.30", "13.30-14.20", "14.20-15.10"],
        "Thursday": ["08.30-09.20", "09.20-10.10", "10.10-11.00", "11.00-11.50", "11.50-12.40", "12.40-13.30", "13.30-14.20", "14.20-15.10"],
        "Friday": ["08.30-09.20", "09.20-10.10", "10.10-11.00", "11.00-11.50", "11.50-12.40", "12.40-13.30"]
    },
    "238": {
        "Monday": ["08.30-09.20", "09.20-10.10", "11.50-12.40", "12.40-13.30"],
        "Tuesday": ["08.30-09.20", "09.20-10.10", "10.10-11.00", "11.00-11.50", "11.50-12.40", "12.40-13.30", "13.30-14.20", "14.20-15.10"],
        "Wednesday": ["08.30-09.20", "09.20-10.10", "10.10-11.00", "11.00-11.50", "11.50-12.40", "12.40-13.30", "13.30-14.20", "14.20-15.10"],
        "Thursday": ["08.30-09.20", "09.20-10.10", "11.50-12.40", "12.40-13.30"],
        "Friday": ["08.30-09.20", "09.20-10.10", "10.10-11.00", "11.00-11.50", "11.50-12.40"]
    }
};

let activeBookings = [];

function getDayOfWeek(dateString) {
    const date = new Date(dateString);
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[date.getDay()];
}

function updateAvailableTimes() {
    const dateVal = document.getElementById('bookingDate').value;
    const roomVal = document.getElementById('roomSelect').value;
    const timeSelect = document.getElementById('timeSelect');

    timeSelect.innerHTML = '<option value="">-- กรุณาเลือกเวลา --</option>';

    if (!dateVal || !roomVal) {
        timeSelect.innerHTML = '<option value="">-- กรุณาเลือกวันและห้องก่อน --</option>';
        return;
    }

    if (roomVal === "king_room") {
        renderTimeOptions(allTimeSlots, timeSelect, dateVal, roomVal);
        return;
    }

    const dayOfWeek = getDayOfWeek(dateVal);

    if (dayOfWeek === "Saturday" || dayOfWeek === "Sunday") {
        timeSelect.innerHTML = '<option value="">-- ไม่มีรอบให้จองในวันเสาร์-อาทิตย์ --</option>';
        return;
    }

    const roomSchedule = scheduleData[roomVal] || {};
    const occupiedSlots = roomSchedule[dayOfWeek] || [];
    const availableSlots = allTimeSlots.filter(slot => !occupiedSlots.includes(slot));

    if (availableSlots.length > 0) {
        renderTimeOptions(availableSlots, timeSelect, dateVal, roomVal);
    } else {
        timeSelect.innerHTML = '<option value="">-- ไม่มีเวลาว่างในวันนี้ --</option>';
    }
}

function renderTimeOptions(slots, element, dateVal, roomVal) {
    const roomName = roomVal === "king_room" ? "ห้องศาสตร์พระราชา" : `ห้องคอมพิวเตอร์ ${roomVal}`;
    
    slots.forEach(slot => {
        // เช็คว่าเวลานี้ถูกจองไปแล้วหรือยังในวันนั้น
        const isBooked = activeBookings.some(b => 
            b.room === roomName && 
            b.date === dateVal && 
            b.time === slot && 
            b.status.includes("กำลังใช้งาน")
        );

        if (!isBooked) {
            const option = document.createElement('option');
            option.value = slot;
            option.textContent = slot;
            element.appendChild(option);
        }
    });

    if (element.options.length <= 1) {
        element.innerHTML = '<option value="">-- เวลาทั้งหมดถูกจองเต็มแล้วในวันนี้ --</option>';
    }
}

function submitBooking() {
    const name = document.getElementById('bookerName').value;
    const date = document.getElementById('bookingDate').value;
    const room = document.getElementById('roomSelect').value;
    const time = document.getElementById('timeSelect').value;

    if (!name || !date || !room || !time) {
        alert('กรุณากรอกข้อมูลการจองให้ครบถ้วน');
        return;
    }

    const roomName = room === "king_room" ? "ห้องศาสตร์พระราชา" : `ห้องคอมพิวเตอร์ ${room}`;

    // เช็คซ้ำอีกรอบเพื่อความปลอดภัยสูงสุด
    const isAlreadyBooked = activeBookings.some(b => 
        b.room === roomName && 
        b.date === date && 
        b.time === time && 
        b.status.includes("กำลังใช้งาน")
    );

    if (isAlreadyBooked) {
        alert('ขออภัย! ห้องนี้ถูกจองในวันและเวลานี้ไปแล้วโดยผู้อื่น กรุณาเลือกเวลาอื่นครับ');
        return;
    }

    activeBookings.push({
        room: roomName,
        name: name,
        date: date,
        time: time,
        status: "กำลังใช้งาน / จองแล้ว"
    });

    alert('จองห้องสำเร็จ!');
    document.getElementById('bookerName').value = '';
    document.getElementById('timeSelect').innerHTML = '<option value="">-- กรุณาเลือกวันและห้องก่อน --</option>';
    
    updateStatusTable();
}

function submitReport() {
    const room = document.getElementById('reportRoomSelect').value;
    const note = document.getElementById('reportNote').value;

    if (!room || !note) {
        alert('กรุณาเลือกห้องและกรอกผลการใช้งาน');
        return;
    }

    const roomName = room === "king_room" ? "ห้องศาสตร์พระราชา" : `ห้องคอมพิวเตอร์ ${room}`;
    let found = false;

    activeBookings.forEach(b => {
        if (b.room === roomName && b.status.includes("กำลังใช้งาน")) {
            b.status = `ใช้งานเสร็จสิ้น (${note})`;
            found = true;
        }
    });

    if (!found) {
        activeBookings.push({
            room: roomName,
            name: "รายงานด่วน",
            date: "-",
            time: "-",
            status: `ใช้งานเสร็จสิ้น (${note})`
        });
    }

    alert('ส่งรายงานการใช้งานเรียบร้อยแล้ว!');
    document.getElementById('reportNote').value = '';
    updateStatusTable();
}

function updateStatusTable() {
    const tbody = document.getElementById('statusTableBody');
    if (activeBookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; border: 1px solid #ddd; padding: 10px;">ยังไม่มีข้อมูลการจองในระบบ</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    activeBookings.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="border: 1px solid #ddd; padding: 8px;">${item.room}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.date}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.time}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.status}</td>
        `;
        tbody.appendChild(tr);
    });
}