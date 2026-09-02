const API_URL = '/api'; // ใช้ /api สำหรับการออนไลน์ผ่านมือถือ

function switchTab(tabName) {
    document.querySelectorAll('.tab-menu button').forEach(btn => btn.classList.remove('tab-active'));
    document.querySelectorAll('.page-content').forEach(page => page.classList.remove('active-page'));
    document.getElementById(`btn-${tabName}`).classList.add('tab-active');
    document.getElementById(`view-${tabName}`).classList.add('active-page');
}

// ฟังก์ชันแปลงวันที่ให้มี ค.ศ. และ พ.ศ. (สำหรับแสดงผลตาราง)
function formatDisplayDate(dateString) {
    if (!dateString) return '-';
    const parts = dateString.split('-'); 
    if (parts.length !== 3) return dateString;
    
    const yearCE = parseInt(parts[0], 10);
    const yearBE = yearCE + 543;
    
    return `${parts[2]}/${parts[1]}/${yearCE} (พ.ศ. ${yearBE})`;
}

// ฟังก์ชันสร้างตัวเลือกวันที่ล่วงหน้า 14 วัน
function generateDateOptions() {
    const dateSelect = document.getElementById('b-date');
    if (dateSelect.options.length > 1) return; // ป้องกันการสร้างตัวเลือกซ้ำ

    dateSelect.innerHTML = '<option value="">-- เลือกวันที่ --</option>';
    
    const today = new Date();
    for (let i = 0; i < 14; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const yearCE = d.getFullYear();
        const yearBE = yearCE + 543; 
        
        const valueDate = `${yearCE}-${month}-${day}`; 
        const textDate = `${day}/${month}/${yearCE} (พ.ศ. ${yearBE})`; 
        
        dateSelect.innerHTML += `<option value="${valueDate}">${textDate}</option>`;
    }
}

// ฟังก์ชันสร้างตัวเลือกเวลา 08:00 - 20:00 น.
function generateTimeOptions() {
    const startSelect = document.getElementById('b-start');
    const endSelect = document.getElementById('b-end');
    if (startSelect.options.length > 1) return; // ป้องกันการสร้างตัวเลือกซ้ำ

    let timeOptions = '<option value="">-- เลือกเวลา --</option>';
    
    for (let h = 8; h <= 20; h++) {
        for (let m = 0; m < 60; m += 30) {
            const hour = String(h).padStart(2, '0');
            const min = String(m).padStart(2, '0');
            const timeStr = `${hour}:${min}`;
            timeOptions += `<option value="${timeStr}">${timeStr} น.</option>`;
        }
    }
    startSelect.innerHTML = timeOptions;
    endSelect.innerHTML = timeOptions;
}

async function fetchData() {
    const response = await fetch(`${API_URL}/data`);
    const { rooms, bookings } = await response.json();
    
    // วาดตาราง (ประวัติทั้งหมด)
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = bookings.map(b => `
        <tr>
            <td>${formatDisplayDate(b.usageDate)}</td>
            <td>${b.startTime} น. - ${b.endTime} น.</td>
            <td><b>${b.roomName}</b></td>
            <td>${b.studentName}</td>
            <td>${b.conditionStatus ? `<b>${b.conditionStatus}</b><br><small>${b.conditionRemark}</small>` : '<span style="color:gray;">ยังไม่คืนห้อง</span>'}</td>
        </tr>
    `).join('');

    // ใส่ข้อมูลห้องใน Dropdown ให้เลือกจอง
    const roomSelect = document.getElementById('room-select');
    roomSelect.innerHTML = '<option value="">-- กรุณาเลือกห้อง --</option>' + 
        rooms.map(r => `<option value="${r.id}">${r.name}</option>`).join('');

    // วาดการ์ดรายการที่ยังไม่คืนห้อง
    const activeGrid = document.getElementById('active-bookings');
    const activeBookings = bookings.filter(b => b.conditionStatus === null);
    
    if (activeBookings.length === 0) {
        activeGrid.innerHTML = '<p style="color:gray; text-align:center; width: 100%;">ไม่มีห้องที่กำลังใช้งาน</p>';
    } else {
        activeGrid.innerHTML = activeBookings.map(b => `
            <div class="active-card">
                <h3 style="margin:0 0 10px 0;">${b.roomName}</h3>
                <p style="margin:5px 0; font-size:14px;"><b>ผู้จอง:</b> ${b.studentName}</p>
                <p style="margin:5px 0; font-size:14px;"><b>วันที่:</b> ${formatDisplayDate(b.usageDate)} <br><b>เวลา:</b> ${b.startTime} น. - ${b.endTime} น.</p>
                <hr style="border:0; border-top:1px dashed #ccc; margin:10px 0;">
                <label style="font-size:12px; font-weight:bold;">รายงานสภาพห้อง:</label>
                <select id="status-${b.id}">
                    <option value="✅ ปกติเรียบร้อย">✅ ปกติเรียบร้อย</option>
                    <option value="🧹 ต้องทำความสะอาด">🧹 ต้องทำความสะอาด</option>
                    <option value="🛠️ มีอุปกรณ์ชำรุด">🛠️ มีอุปกรณ์ชำรุด</option>
                </select>
                <input type="text" id="remark-${b.id}" placeholder="ระบุเพิ่มเติม (เช่น แอร์ไม่เย็น)">
                <button class="btn btn-return" onclick="returnRoom(${b.id})">ส่งรายงานและคืนห้อง</button>
            </div>
        `).join('');
    }

    // สร้างตัวเลือกวันที่และเวลาแบบ Dropdown
    generateDateOptions();
    generateTimeOptions();
}

async function bookRoom() {
    const roomId = document.getElementById('room-select').value;
    const name = document.getElementById('b-name').value;
    const date = document.getElementById('b-date').value;
    const start = document.getElementById('b-start').value;
    const end = document.getElementById('b-end').value;

    if (!roomId || !name || !date || !start || !end) return alert('กรุณากรอกข้อมูลให้ครบทุกช่อง');

    const res = await fetch(`${API_URL}/book`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ roomId, studentName: name, usageDate: date, startTime: start, endTime: end })
    });
    
    const result = await res.json();
    alert(result.message);
    if (result.success) {
        // ล้างข้อมูลในฟอร์มเมื่อจองสำเร็จ
        document.getElementById('b-name').value = '';
        document.getElementById('b-date').value = '';
        document.getElementById('b-start').value = '';
        document.getElementById('b-end').value = '';
        fetchData();
    }
}

async function returnRoom(bookingId) {
    const status = document.getElementById(`status-${bookingId}`).value;
    const remark = document.getElementById(`remark-${bookingId}`).value;

    if (!confirm('ยืนยันส่งรายงานสภาพห้อง?')) return;

    await fetch(`${API_URL}/return`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ bookingId, conditionStatus: status, conditionRemark: remark })
    });
    alert('บันทึกสำเร็จ!');
    fetchData();
}

fetchData();