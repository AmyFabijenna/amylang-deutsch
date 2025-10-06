// ===================================
// HÜPP.JS - Ausgelagertes JavaScript
// ===================================

// Supabase Initialisierung
const { createClient } = window.supabase;
const supabaseUrl = 'https://smmspsnquuqischuhjyn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtbXNwc25xdXVxaXNjaHVoanluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NTQ1ODUsImV4cCI6MjA3NTMzMDU4NX0.xffqRWQYlg_25wkXMe0gU6QqkLBoFNqhjjmepPEF-xc';
const supabase = createClient(supabaseUrl, supabaseKey);

// Globale Variablen
let students = [];
let rescheduleRequests = [];
let homework = [];
let currentEditStudent = null;
let whatsappLink = '';

const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

// Lade Daten aus Supabase
async function loadData() {
    await loadStudents();
    await loadRescheduleRequests();
    await loadHomework();
    renderAll();
}

async function loadStudents() {
    const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('name');
    
    if (error) {
        console.error('Fehler beim Laden der Schüler:', error);
        return;
    }
    students = data || [];
}

async function loadRescheduleRequests() {
    const { data, error } = await supabase
        .from('reschedule_requests')
        .select('*')
        .eq('status', 'pending')
        .order('request_date', { ascending: true });
    
    if (error) {
        console.error('Fehler beim Laden der Anfragen:', error);
        return;
    }
    rescheduleRequests = data || [];
}

async function loadHomework() {
    const { data, error } = await supabase
        .from('homework')
        .select('*')
        .order('due_date', { ascending: true });
    
    if (error) {
        console.error('Fehler beim Laden der Hausaufgaben:', error);
        return;
    }
    homework = data || [];
}

// Berechne nächsten Termin (unterstützt mehrere wöchentliche Termine)
function getNextLesson(student) {
    if (!student.standard_times || student.standard_times.length === 0) return null;
    
    const today = new Date();
    const allUpcomingLessons = [];
    
    student.standard_times.forEach(timeSlot => {
        const stdDay = timeSlot.day;
        const [hours, minutes] = timeSlot.time.split(':');
        
        let nextDate = new Date();
        nextDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        while (nextDate.getDay() !== stdDay || nextDate < today) {
            nextDate.setDate(nextDate.getDate() + 1);
        }
        
        allUpcomingLessons.push({
            date: nextDate,
            time: timeSlot.time,
            duration: timeSlot.duration,
            day: timeSlot.day
        });
    });
    
    allUpcomingLessons.sort((a, b) => a.date - b.date);
    return allUpcomingLessons[0];
}

// Render Next Student Widget
function renderNextStudent() {
    const studentsWithLessons = students
        .filter(s => s.standard_times && s.standard_times.length > 0)
        .map(s => ({ ...s, nextLesson: getNextLesson(s) }))
        .filter(s => s.nextLesson)
        .sort((a, b) => a.nextLesson.date - b.nextLesson.date);
    
    const nextStudent = studentsWithLessons[0];
    const widget = document.getElementById('nextStudentWidget');
    
    if (!nextStudent) {
        widget.innerHTML = '<p>Keine Termine geplant</p>';
        return;
    }
    
    const nextLesson = nextStudent.nextLesson;
    widget.innerHTML = `
        <div class="student-info">${nextStudent.name}</div>
        <div class="lesson-details">
            <div>📅 ${nextLesson.date.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit' })}</div>
            <div>🕐 ${nextLesson.time} Uhr</div>
            <div>⏱️ ${nextLesson.duration} Min</div>
        </div>
        <div class="whatsapp-sender">
            <input type="text" id="whatsappLinkInput" placeholder="Link hier einfügen (z.B. kMeet-Link)..." value="${whatsappLink}">
            <button onclick="sendWhatsAppLink('${nextStudent.phone}', '${nextStudent.name}')">
                📱 WhatsApp senden
            </button>
        </div>
    `;
}

// WhatsApp Link senden
window.sendWhatsAppLink = function(phone, name) {
    const link = document.getElementById('whatsappLinkInput').value.trim();
    if (!link) {
        alert('Bitte einen Link eingeben!');
        return;
    }
    
    if (!phone) {
        alert('Schüler hat keine Telefonnummer hinterlegt!');
        return;
    }
    
    const firstName = name.split(' ')[0];
    const message = encodeURIComponent(`Hallo ${firstName}! Hier ist dein Link für die nächste Stunde: ${link}`);
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
    document.getElementById('whatsappLinkInput').value = '';
};

// Render Today's Lessons
function renderTodayLessons() {
    const today = new Date();
    const todayDay = today.getDay();
    
    document.getElementById('todayDate').textContent = today.toLocaleDateString('de-DE', { 
        weekday: 'long', 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
    });
    
    const todayLessons = [];
    
    students.forEach(student => {
        if (!student.standard_times) return;
        
        student.standard_times.forEach(timeSlot => {
            if (timeSlot.day === todayDay) {
                todayLessons.push({
                    student: student,
                    time: timeSlot.time,
                    duration: timeSlot.duration
                });
            }
        });
    });
    
    todayLessons.sort((a, b) => a.time.localeCompare(b.time));
    
    const container = document.getElementById('todayLessons');
    
    if (todayLessons.length === 0) {
        container.innerHTML = '<p style="color: #8B4513; text-align: center; padding: 40px;">Keine Termine heute</p>';
        return;
    }
    
    container.innerHTML = todayLessons.map(lesson => `
        <div class="student-card">
            <div class="student-card-header">
                <div>
                    <div class="student-name">${lesson.student.name}</div>
                    <div class="student-details">
                        🕐 ${lesson.time} Uhr | ⏱️ ${lesson.duration} Min
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="color: #666; font-size: 0.9em;">Seit: ${lesson.student.start_date || 'k.A.'}</div>
                    <div style="color: #8B4513; font-weight: bold;">📚 ${lesson.student.total_lessons || 0} Stunden</div>
                </div>
            </div>
        </div>
    `).join('');
}

// Render Requests
function renderRequests() {
    const pending = rescheduleRequests.filter(r => r.status === 'pending');
    const container = document.getElementById('requestsList');
    const badge = document.getElementById('requestBadge');
    
    badge.textContent = pending.length > 0 ? `(${pending.length})` : '';
    
    if (pending.length === 0) {
        container.innerHTML = '<p style="color: #8B4513; text-align: center; padding: 40px;">Keine offenen Anfragen</p>';
        return;
    }
    
    container.innerHTML = pending.map(r => `
        <div class="student-card request-card">
            <div class="student-name">
                ${r.student_name}
                <span class="badge badge-pending">Ausstehend</span>
            </div>
            <div class="student-details">
                <div><strong>Von:</strong> ${new Date(r.original_date).toLocaleDateString('de-DE')} ${r.original_time} Uhr</div>
                <div><strong>Nach:</strong> ${r.requested_date} ${r.requested_time} Uhr</div>
                <div><strong>Grund:</strong> ${r.reason || 'Kein Grund angegeben'}</div>
                <div style="font-size: 0.9em; color: #666; margin-top: 5px;">
                    Angefragt am: ${new Date(r.request_date).toLocaleString('de-DE')}
                </div>
            </div>
            <div class="btn-group" style="margin-top: 15px;">
                <button class="btn btn-approve" onclick="handleRequest('${r.id}', true)">
                    ✓ Genehmigen
                </button>
                <button class="btn btn-reject" onclick="handleRequest('${r.id}', false)">
                    ✗ Ablehnen
                </button>
            </div>
        </div>
    `).join('');
}

// Handle Reschedule Request
window.handleRequest = async function(requestId, approve) {
    try {
        const { error } = await supabase
            .from('reschedule_requests')
            .update({
                status: approve ? 'approved' : 'rejected',
                processed_at: new Date().toISOString()
            })
            .eq('id', requestId);
        
        if (error) throw error;
        
        alert(approve ? 'Anfrage genehmigt!' : 'Anfrage abgelehnt');
        await loadRescheduleRequests();
        renderAll();
    } catch (error) {
        alert('Fehler: ' + error.message);
    }
};

// Render Students List
function renderStudentsList() {
    const container = document.getElementById('studentsList');
    
    container.innerHTML = students.map(s => {
        const nextLesson = getNextLesson(s);
        const allTimes = s.standard_times || [];
        
        return `
            <div class="student-card">
                <div class="student-card-header">
                    <div style="flex: 1;">
                        <div class="student-name">${s.name}</div>
                        <div class="student-details">
                            ${allTimes.length > 0 ? `
                                <div style="margin-bottom: 10px;"><strong>📅 Wöchentliche Termine:</strong></div>
                                ${allTimes.map(t => `
                                    <div style="margin-left: 15px;">
                                        • ${dayNames[t.day]} ${t.time} Uhr (${t.duration} Min)
                                    </div>
                                `).join('')}
                                <div style="margin-top: 10px;">
                                    🎯 Nächste Stunde: ${nextLesson ? nextLesson.date.toLocaleDateString('de-DE') + ' ' + nextLesson.time + ' Uhr' : 'k.A.'}
                                </div>
                            ` : '<div>⚠️ Noch keine Termine festgelegt</div>'}
                            <div style="margin-top: 5px;">📞 ${s.phone || 'Keine Telefonnummer'}</div>
                            <div style="margin-top: 5px;">📚 Beginn: ${s.start_date || 'k.A.'} | Gesamt: ${s.total_lessons || 0} Stunden</div>
                        </div>
                    </div>
                    <button class="btn btn-edit" onclick="openEditModal('${s.id}')">
                        ✏️ Bearbeiten
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Open Edit Modal
window.openEditModal = function(studentId) {
    const student = students.find(s => s.id == studentId);
    if (!student) return;
    
    currentEditStudent = studentId;
    
    const timeSlotsContainer = document.getElementById('timeSlotsContainer');
    timeSlotsContainer.innerHTML = '';
    
    if (student.standard_times && student.standard_times.length > 0) {
        student.standard_times.forEach((timeSlot) => {
            addTimeSlotToModal(timeSlot);
        });
    } else {
        addTimeSlotToModal();
    }
    
    document.getElementById('editStartDate').value = student.start_date || '';
    document.getElementById('editTotalLessons').value = student.total_lessons || 0;
    document.getElementById('editPhone').value = student.phone || '';
    
    document.getElementById('editStudentModal').classList.add('active');
};

// Add Time Slot to Modal
function addTimeSlotToModal(timeSlot = null) {
    const container = document.getElementById('timeSlotsContainer');
    const timeSlotDiv = document.createElement('div');
    timeSlotDiv.className = 'time-slot';
    timeSlotDiv.innerHTML = `
        <div class="form-group">
            <label>Wochentag</label>
            <select class="time-day">
                <option value="1">Montag</option>
                <option value="2">Dienstag</option>
                <option value="3">Mittwoch</option>
                <option value="4">Donnerstag</option>
                <option value="5">Freitag</option>
                <option value="6">Samstag</option>
                <option value="0">Sonntag</option>
            </select>
        </div>
        <div class="form-group">
            <label>Uhrzeit</label>
            <input type="time" class="time-time" value="${timeSlot?.time || '14:00'}">
        </div>
        <div class="form-group">
            <label>Dauer (Minuten)</label>
            <input type="number" class="time-duration" value="${timeSlot?.duration || 60}" min="15" step="15">
        </div>
        ${container.children.length > 0 ? `<button type="button" class="remove-time" onclick="this.parentElement.remove()">❌ Entfernen</button>` : ''}
    `;
    
    if (timeSlot) {
        timeSlotDiv.querySelector('.time-day').value = timeSlot.day;
    }
    
    container.appendChild(timeSlotDiv);
}

window.addTimeSlot = function() {
    addTimeSlotToModal();
};

// Save Student Edit
window.saveStudentEdit = async function() {
    if (!currentEditStudent) return;
    
    const timeSlots = [];
    document.querySelectorAll('#timeSlotsContainer .time-slot').forEach(slot => {
        const day = parseInt(slot.querySelector('.time-day').value);
        const time = slot.querySelector('.time-time').value;
        const duration = parseInt(slot.querySelector('.time-duration').value);
        
        if (day !== null && time && duration) {
            timeSlots.push({ day, time, duration });
        }
    });
    
    const updates = {
        standard_times: timeSlots,
        start_date: document.getElementById('editStartDate').value,
        total_lessons: parseInt(document.getElementById('editTotalLessons').value) || 0,
        phone: document.getElementById('editPhone').value
    };
    
    try {
        const { error } = await supabase
            .from('students')
            .update(updates)
            .eq('id', currentEditStudent);
        
        if (error) throw error;
        
        alert('Erfolgreich gespeichert!');
        closeModal();
        await loadData();
    } catch (error) {
        alert('Fehler beim Speichern: ' + error.message);
    }
};

// Add New Student
window.openAddStudentModal = function() {
    document.getElementById('addStudentModal').classList.add('active');
};

window.saveNewStudent = async function() {
    const name = document.getElementById('addStudentName').value.trim();
    const email = document.getElementById('addStudentEmail').value.trim();
    const phone = document.getElementById('addStudentPhone').value.trim();
    const motherLanguage = document.getElementById('addStudentMotherLanguage').value.trim();
    const goals = document.getElementById('addStudentGoals').value.trim();
    const level = document.getElementById('addStudentLevel').value;
    
    if (!name || !email) {
        alert('Bitte Name und Email ausfüllen!');
        return;
    }
    
    const words = ['katze', 'mango', 'ananas', 'koala', 'giraffe', 'kiwi', 'banane', 'tiger', 'panda', 'apfel'];
    const password = words[Math.floor(Math.random() * words.length)];
    
    try {
        const { error } = await supabase
            .from('students')
            .insert([{
                name: name,
                email: email,
                password: password,
                phone: phone,
                mother_language: motherLanguage,
                goals: goals,
                level: level,
                learning_type: '',
                standard_times: [],
                start_date: new Date().toISOString().split('T')[0],
                total_lessons: 0,
                created_at: new Date().toISOString()
            }]);
        
        if (error) throw error;
        
        alert('Schüler erfolgreich erstellt! Passwort: ' + password);
        closeModal();
        await loadData();
        
        document.getElementById('addStudentName').value = '';
        document.getElementById('addStudentEmail').value = '';
        document.getElementById('addStudentPhone').value = '';
        document.getElementById('addStudentMotherLanguage').value = '';
        document.getElementById('addStudentGoals').value = '';
        document.getElementById('addStudentLevel').value = '';
        
    } catch (error) {
        alert('Fehler: ' + error.message);
    }
};

// Close Modal
window.closeModal = function() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    currentEditStudent = null;
};

// Tab Switching
window.switchTab = function(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tabName + '-section').classList.add('active');
};

// Render Homework Management
function renderHomeworkManagement() {
    const container = document.getElementById('hwStudentsGrid');
    
    if (students.length === 0) {
        container.innerHTML = '<p style="color: #8B4513; text-align: center; padding: 40px;">Keine Schüler vorhanden</p>';
        return;
    }
    
    container.innerHTML = students.map(student => {
        const studentHomework = homework.filter(hw => hw.student_id === student.id);
        const pending = studentHomework.filter(hw => !hw.completed);
        const completed = studentHomework.filter(hw => hw.completed);
        
        return `
            <div class="student-card">
                <div class="student-name">${student.name}</div>
                <div class="student-details">
                    <div>📝 ${pending.length} offene Hausaufgaben</div>
                    <div>✅ ${completed.length} erledigt</div>
                </div>
            </div>
        `;
    }).join('');
}

// 30-Min Erinnerung
function checkUpcomingLessons() {
    const now = new Date();
    const in30Min = new Date(now.getTime() + 30 * 60000);
    
    students.forEach(student => {
        if (!student.standard_times) return;
        
        const nextLesson = getNextLesson(student);
        if (nextLesson && nextLesson.date > now && nextLesson.date <= in30Min) {
            showNotification(student);
        }
    });
}

function showNotification(student) {
    const notification = document.getElementById('notification');
    const text = document.getElementById('notificationText');
    
    text.textContent = `${student.name} - ${getNextLesson(student).time} Uhr`;
    notification.style.display = 'block';
    
    document.getElementById('bambooSound').play().catch(() => {});
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 10000);
}

// Render All
function renderAll() {
    renderNextStudent();
    renderTodayLessons();
    renderRequests();
    renderStudentsList();
    renderHomeworkManagement();
}

// Initialisierung
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    setInterval(checkUpcomingLessons, 60000);
    checkUpcomingLessons();
});