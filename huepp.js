// ===================================
// HÜPP.JS - Vollständig überarbeitet
// ===================================

// Supabase Initialisierung
const { createClient } = window.supabase;
const supabaseUrl = 'https://hfdjnttxavlghjfnjkms.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmZGpudHR4YXZsZ2hqZm5qa21zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2OTQwNTIsImV4cCI6MjA3NTI3MDA1Mn0.LBLAkKzkquHvAmvFix4jIrudCVMGGjs5kfvK4l0RfIM';
const supabase = createClient(supabaseUrl, supabaseKey);

// Globale Variablen
let students = [];
let rescheduleRequests = [];
let homework = [];
let currentEditStudent = null;
let currentEditHomework = null;
let whatsappLink = '';

const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

// ===================================
// DATEN LADEN
// ===================================

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
        .order('deadline', { ascending: true });
    
    if (error) {
        console.error('Fehler beim Laden der Hausaufgaben:', error);
        return;
    }
    homework = data || [];
}

// ===================================
// KALENDER-FUNKTIONEN
// ===================================

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

// Berechne verstrichene Einheiten seit Startdatum
function calculateCompletedLessons(student) {
    if (!student.start_date || !student.standard_times || student.standard_times.length === 0) {
        return 0;
    }
    
    const startDate = new Date(student.start_date);
    const today = new Date();
    
    // Nur volle Wochen zählen
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const weeksPassed = Math.floor((today - startDate) / msPerWeek);
    
    // Anzahl Termine pro Woche
    const lessonsPerWeek = student.standard_times.length;
    
    return weeksPassed * lessonsPerWeek;
}

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
    const completedLessons = calculateCompletedLessons(nextStudent);
    
    widget.innerHTML = `
        <div class="student-info">${nextStudent.name}</div>
        <div class="lesson-details">
            <div>📅 ${nextLesson.date.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit' })}</div>
            <div>🕐 ${nextLesson.time} Uhr</div>
            <div>⏱️ ${nextLesson.duration} Min</div>
            <div>📚 ${completedLessons} Einheiten</div>
        </div>
        <div class="whatsapp-sender">
            <input type="text" id="whatsappLinkInput" placeholder="Link hier einfügen (z.B. kMeet-Link)..." value="${whatsappLink}">
            <button onclick="sendWhatsAppLink('${nextStudent.phone}', '${nextStudent.name}')">
                📱 WhatsApp senden
            </button>
        </div>
    `;
}

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
    
    container.innerHTML = todayLessons.map(lesson => {
        const completedLessons = calculateCompletedLessons(lesson.student);
        return `
            <div class="student-card">
                <div style="display: flex; justify-content: space-between;">
                    <div>
                        <div class="student-name">${lesson.student.name}</div>
                        <div class="student-details">
                            🕐 ${lesson.time} Uhr | ⏱️ ${lesson.duration} Min
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="color: #666; font-size: 0.9em;">Seit: ${lesson.student.start_date || 'k.A.'}</div>
                        <div style="color: #8B4513; font-weight: bold;">📚 ${completedLessons} Einheiten</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ===================================
// ANFRAGEN
// ===================================

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
        <div class="student-card" style="border-left-color: #FFA500;">
            <div class="student-name">
                ${r.student_name}
                <span class="badge badge-pending">Ausstehend</span>
            </div>
            <div class="student-details">
                <div><strong>Von:</strong> ${new Date(r.original_date).toLocaleDateString('de-DE')} ${r.original_time} Uhr</div>
                <div><strong>Nach:</strong> ${r.requested_date} ${r.requested_time} Uhr</div>
                <div><strong>Grund:</strong> ${r.reason || 'Kein Grund angegeben'}</div>
            </div>
            <div style="display: flex; gap: 10px; margin-top: 15px;">
                <button class="btn btn-approve" onclick="handleRequest('${r.id}', true)">
                    ✓ Genehmigen
                </button>
                <button class="btn" style="background: #f44336; color: white;" onclick="handleRequest('${r.id}', false)">
                    ✗ Ablehnen
                </button>
            </div>
        </div>
    `).join('');
}

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

// ===================================
// SCHÜLER-VERWALTUNG
// ===================================

function renderStudentsList() {
    const container = document.getElementById('studentsList');
    
    container.innerHTML = students.map(s => {
        const nextLesson = getNextLesson(s);
        const allTimes = s.standard_times || [];
        const completedLessons = calculateCompletedLessons(s);
        
        return `
            <div class="student-card">
                <div style="display: flex; justify-content: space-between; align-items: start;">
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
                            <div style="margin-top: 5px;">📚 Beginn: ${s.start_date || 'k.A.'} | Einheiten: ${completedLessons}</div>
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
        ${container.children.length > 0 ? `<button type="button" class="remove-time" onclick="this.parentElement.remove()">✖ Entfernen</button>` : ''}
    `;
    
    if (timeSlot) {
        timeSlotDiv.querySelector('.time-day').value = timeSlot.day;
    }
    
    container.appendChild(timeSlotDiv);
}

window.addTimeSlot = function() {
    addTimeSlotToModal();
};

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

// ===================================
// HAUSAUFGABEN-VERWALTUNG (NEU!)
// ===================================

function renderHomeworkManagement() {
    const container = document.getElementById('hwStudentsGrid');
    
    if (students.length === 0) {
        container.innerHTML = '<p style="color: #8B4513; text-align: center; padding: 40px;">Keine Schüler vorhanden</p>';
        return;
    }
    
    container.innerHTML = students.map(student => {
        const studentHomework = homework.filter(hw => hw.student_id === student.id);
        const pending = studentHomework.filter(hw => !hw.completed);
        const hasUnread = studentHomework.some(hw => !hw.is_read);
        
        return `
            <div class="hw-student-card">
                ${hasUnread ? '<div class="hw-status-indicator unread" title="Ungelesene Hausaufgaben"></div>' : '<div class="hw-status-indicator read"></div>'}
                <div class="student-name">${student.name}</div>
                <div class="student-details">
                    📝 ${pending.length} offene | ✅ ${studentHomework.length - pending.length} erledigt
                </div>
                
                <div class="hw-list">
                    ${studentHomework.length === 0 ? 
                        '<p style="color: #666; font-style: italic;">Keine Hausaufgaben</p>' :
                        studentHomework.slice(0, 3).map(hw => `
                            <div class="hw-item" onclick="openEditHomeworkModal('${hw.id}')">
                                <div>
                                    <div class="hw-item-title">${hw.title}</div>
                                    <div class="hw-item-meta">
                                        📅 ${new Date(hw.deadline).toLocaleDateString('de-DE')} 
                                        ${hw.completed ? '| ✅ Erledigt' : ''}
                                    </div>
                                </div>
                                <div>
                                    <span class="read-badge ${hw.is_read ? 'read' : ''}">
                                        ${hw.is_read ? '👁️ Gelesen' : '🔴 Ungelesen'}
                                    </span>
                                </div>
                            </div>
                        `).join('')
                    }
                    ${studentHomework.length > 3 ? `<p style="color: #666; font-size: 0.9em; margin-top: 10px;">... und ${studentHomework.length - 3} weitere</p>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

window.openAddHomeworkModal = function() {
    // Schüler-Dropdown füllen
    const select = document.getElementById('hwStudentSelect');
    select.innerHTML = '<option value="">Bitte wählen</option>' + 
        students.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    
    document.getElementById('addHomeworkModal').classList.add('active');
};

window.toggleCustomSubmission = function() {
    const type = document.getElementById('hwSubmissionType').value;
    const customGroup = document.getElementById('customSubmissionGroup');
    customGroup.style.display = type === 'custom' ? 'block' : 'none';
};

window.saveNewHomework = async function() {
    const studentId = document.getElementById('hwStudentSelect').value;
    const title = document.getElementById('hwTitle').value.trim();
    const description = document.getElementById('hwDescription').value.trim();
    const deadline = document.getElementById('hwDeadline').value;
    const submissionType = document.getElementById('hwSubmissionType').value;
    const customText = document.getElementById('hwCustomSubmission').value.trim();
    
    if (!studentId || !title || !deadline) {
        alert('Bitte alle Pflichtfelder ausfüllen!');
        return;
    }
    
    try {
        const { error } = await supabase
            .from('homework')
            .insert([{
                student_id: studentId,
                title: title,
                description: description,
                deadline: deadline,
                submission_type: submissionType,
                custom_submission_text: submissionType === 'custom' ? customText : null,
                type: submissionType, // Für Kompatibilität mit schueler.html
                completed: false,
                is_read: false,
                last_updated: new Date().toISOString(),
                created_at: new Date().toISOString()
            }]);
        
        if (error) throw error;
        
        alert('Hausaufgabe erfolgreich erstellt!');
        closeModal();
        await loadHomework();
        renderHomeworkManagement();
        
        // Formular leeren
        document.getElementById('hwStudentSelect').value = '';
        document.getElementById('hwTitle').value = '';
        document.getElementById('hwDescription').value = '';
        document.getElementById('hwDeadline').value = '';
        document.getElementById('hwSubmissionType').value = 'text';
        document.getElementById('hwCustomSubmission').value = '';
        document.getElementById('customSubmissionGroup').style.display = 'none';
        
    } catch (error) {
        alert('Fehler: ' + error.message);
    }
};

window.openEditHomeworkModal = async function(homeworkId) {
    const hw = homework.find(h => h.id === homeworkId);
    if (!hw) return;
    
    currentEditHomework = homeworkId;
    
    // Felder füllen
    document.getElementById('editHwTitle').value = hw.title;
    document.getElementById('editHwDescription').value = hw.description || '';
    document.getElementById('editHwDeadline').value = hw.deadline.slice(0, 16); // Format für datetime-local
    document.getElementById('editHwSubmissionType').value = hw.submission_type;
    document.getElementById('editHwCustomSubmission').value = hw.custom_submission_text || '';
    
    toggleEditCustomSubmission();
    
    // Als gelesen markieren (automatisch beim Öffnen durch Trainer)
    if (!hw.is_read) {
        await supabase
            .from('homework')
            .update({ is_read: true })
            .eq('id', homeworkId);
    }
    
    document.getElementById('editHomeworkModal').classList.add('active');
};

window.toggleEditCustomSubmission = function() {
    const type = document.getElementById('editHwSubmissionType').value;
    const customGroup = document.getElementById('editCustomSubmissionGroup');
    customGroup.style.display = type === 'custom' ? 'block' : 'none';
};

window.saveEditedHomework = async function() {
    if (!currentEditHomework) return;
    
    const title = document.getElementById('editHwTitle').value.trim();
    const description = document.getElementById('editHwDescription').value.trim();
    const deadline = document.getElementById('editHwDeadline').value;
    const submissionType = document.getElementById('editHwSubmissionType').value;
    const customText = document.getElementById('editHwCustomSubmission').value.trim();
    
    if (!title || !deadline) {
        alert('Bitte alle Pflichtfelder ausfüllen!');
        return;
    }
    
    try {
        const { error } = await supabase
            .from('homework')
            .update({
                title: title,
                description: description,
                deadline: deadline,
                submission_type: submissionType,
                custom_submission_text: submissionType === 'custom' ? customText : null,
                type: submissionType,
                is_read: false, // Zurücksetzen bei Änderung
                last_updated: new Date().toISOString()
            })
            .eq('id', currentEditHomework);
        
        if (error) throw error;
        
        alert('Hausaufgabe aktualisiert! Status wurde auf "ungelesen" zurückgesetzt.');
        closeModal();
        await loadHomework();
        renderHomeworkManagement();
        
    } catch (error) {
        alert('Fehler: ' + error.message);
    }
};

window.deleteHomework = async function() {
    if (!currentEditHomework) return;
    
    if (!confirm('Hausaufgabe wirklich löschen?')) return;
    
    try {
        const { error } = await supabase
            .from('homework')
            .delete()
            .eq('id', currentEditHomework);
        
        if (error) throw error;
        
        alert('Hausaufgabe gelöscht!');
        closeModal();
        await loadHomework();
        renderHomeworkManagement();
        
    } catch (error) {
        alert('Fehler: ' + error.message);
    }
};

// ===================================
// MODALS & TABS
// ===================================

window.closeModal = function() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    currentEditStudent = null;
    currentEditHomework = null;
};

window.switchTab = function(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tabName + '-section').classList.add('active');
};

// ===================================
// 30-MIN ERINNERUNG
// ===================================

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

// ===================================
// RENDER ALL
// ===================================

function renderAll() {
    renderNextStudent();
    renderTodayLessons();
    renderRequests();
    renderStudentsList();
    renderHomeworkManagement();
}

// ===================================

// INITIALISIERUNG
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    loadData();
    setInterval(checkUpcomingLessons, 60000);
    checkUpcomingLessons();
});