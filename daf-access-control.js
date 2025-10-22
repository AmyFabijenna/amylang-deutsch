// ========================================
// DAF ACCESS CONTROL SYSTEM - VERBESSERT
// Scrollbares Formular + bessere Speicherung
// ========================================

// EmailJS Konfiguration - HIER DEINE DATEN EINTRAGEN!
const EMAILJS_PUBLIC_KEY = 'uHuMA9ENgQnUoLbRk';
const EMAILJS_SERVICE_ID = 'service_a6xg9yh';
const EMAILJS_TEMPLATE_NOTIFICATION = 'template_a68eqvc';
const EMAILJS_TEMPLATE_USER = 'template_r0oco3m';

// EmailJS Bibliothek laden
(function() {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
    script.onload = function() {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    };
    document.head.appendChild(script);
})();

// Prüfe ob Nutzer bereits Zugang hat
function checkAccess() {
    const accessGranted = localStorage.getItem('daf_access_granted');
    const userEmail = localStorage.getItem('daf_user_email');
    
    if (accessGranted === 'true' && userEmail) {
        return true;
    }
    return false;
}

// Registrierungsdialog anzeigen - VERBESSERT mit Scrolling
function showRegistrationDialog() {
    const overlay = document.createElement('div');
    overlay.id = 'daf-access-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 999999;
        padding: 20px;
        box-sizing: border-box;
    `;

    overlay.innerHTML = `
        <div style="
            background: white;
            border-radius: 20px;
            max-width: 550px;
            width: 100%;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        ">
            <!-- Header (fixiert) -->
            <div style="
                padding: 30px 40px 20px 40px;
                border-bottom: 1px solid #eee;
                flex-shrink: 0;
            ">
                <h2 style="color: #667eea; text-align: center; margin: 0 0 15px 0; font-size: 1.6em;">
                    🔐 Zugang zu Amys Deutsch/DAF-Materialien
                </h2>
                <p style="text-align: center; color: #666; margin: 0; line-height: 1.5; font-size: 0.95em;">
                    Registriere dich einmalig für dauerhaften Zugang zu allen Lernmaterialien
                </p>
            </div>

            <!-- Scrollbarer Inhalt -->
            <div style="
                flex: 1;
                overflow-y: auto;
                padding: 30px 40px;
            ">
                <form id="daf-registration-form">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333; font-size: 0.95em;">Name: *</label>
                        <input type="text" name="name" required placeholder="Dein vollständiger Name"
                            style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 1em; box-sizing: border-box;">
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333; font-size: 0.95em;">Email: *</label>
                        <input type="email" name="email" required placeholder="deine@email.com"
                            style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 1em; box-sizing: border-box;">
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333; font-size: 0.95em;">Altersklasse: *</label>
                        <select name="altersklasse" required 
                            style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 1em; box-sizing: border-box;">
                            <option value="">Bitte wählen...</option>
                            <option value="Unter 18">Unter 18 Jahre</option>
                            <option value="18-25">18-25 Jahre</option>
                            <option value="26-35">26-35 Jahre</option>
                            <option value="36-45">36-45 Jahre</option>
                            <option value="46-55">46-55 Jahre</option>
                            <option value="56-65">56-65 Jahre</option>
                            <option value="Über 65">Über 65 Jahre</option>
                        </select>
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333; font-size: 0.95em;">Muttersprache: *</label>
                        <select name="muttersprache" required 
                            style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 1em; box-sizing: border-box;">
                            <option value="">Bitte wählen...</option>
                            <option value="Englisch">Englisch</option>
                            <option value="Ungarisch">Ungarisch</option>
                            <option value="Italienisch">Italienisch</option>
                            <option value="Französisch">Französisch</option>
                            <option value="Niederländisch">Niederländisch</option>
                            <option value="Spanisch">Spanisch</option>
                            <option value="Portugiesisch">Portugiesisch</option>
                            <option value="Polnisch">Polnisch</option>
                            <option value="Russisch">Russisch</option>
                            <option value="Arabisch">Arabisch</option>
                            <option value="Türkisch">Türkisch</option>
                            <option value="Chinesisch">Chinesisch</option>
                            <option value="Japanisch">Japanisch</option>
                            <option value="Koreanisch">Koreanisch</option>
                            <option value="Andere">Andere</option>
                        </select>
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333; font-size: 0.95em;">Könnerstufe Deutsch: *</label>
                        <select name="koennerstufe" required 
                            style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 1em; box-sizing: border-box;">
                            <option value="">Bitte wählen...</option>
                            <option value="A1">A1 - Anfänger</option>
                            <option value="A2">A2 - Grundlegende Kenntnisse</option>
                            <option value="B1">B1 - Fortgeschritten</option>
                            <option value="B2">B2 - Selbständige Sprachverwendung</option>
                            <option value="C1">C1 - Fachkundige Sprachkenntnisse</option>
                            <option value="C2">C2 - Annähernd muttersprachliche Kenntnisse</option>
                        </select>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333; font-size: 0.95em;">
                            Wünsche / Mitteilungen:
                            <span style="font-weight: normal; color: #888; font-size: 0.9em;">(optional, max. 500 Zeichen)</span>
                        </label>
                        <textarea name="mitteilungen" rows="3" maxlength="500"
                            placeholder="Hast du spezielle Lernziele oder Wünsche?"
                            style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 1em; box-sizing: border-box; resize: vertical; font-family: inherit;"></textarea>
                        <div id="char-counter" style="text-align: right; font-size: 0.85em; color: #888; margin-top: 5px;">0 / 500 Zeichen</div>
                    </div>

                    <button type="submit" style="
                        width: 100%;
                        padding: 15px;
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        color: white;
                        border: none;
                        border-radius: 10px;
                        font-size: 1.1em;
                        font-weight: bold;
                        cursor: pointer;
                        transition: transform 0.2s;
                        margin-bottom: 15px;
                    ">
                        ✉️ Registrierung absenden
                    </button>

                    <div style="text-align: center; padding-top: 15px; border-top: 1px solid #eee;">
                        <p style="font-size: 0.9em; color: #666; margin-bottom: 10px;">
                            Bereits registriert? Anderes Gerät?
                        </p>
                        <button type="button" onclick="showRenewAccessDialog()" style="
                            padding: 10px 20px;
                            background: transparent;
                            color: #667eea;
                            border: 2px solid #667eea;
                            border-radius: 8px;
                            font-size: 0.95em;
                            font-weight: bold;
                            cursor: pointer;
                            transition: all 0.2s;
                        " onmouseover="this.style.background='#667eea'; this.style.color='white';" 
                           onmouseout="this.style.background='transparent'; this.style.color='#667eea';">
                            🔑 Zugang erneuern
                        </button>
                    </div>

                    <p style="margin-top: 15px; font-size: 0.85em; text-align: center; color: #666; line-height: 1.5;">
                        Du erhältst eine Email mit einem Bestätigungslink.<br>
                        Nach der Bestätigung hast du dauerhaften Zugang.
                    </p>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    // Event Listener
    const form = document.getElementById('daf-registration-form');
    form.addEventListener('submit', handleRegistration);

    const textarea = form.querySelector('textarea[name="mitteilungen"]');
    const charCounter = document.getElementById('char-counter');
    textarea.addEventListener('input', function() {
        charCounter.textContent = this.value.length + ' / 500 Zeichen';
    });
}

// Dialog für Zugang erneuern - AUCH SCROLLBAR
function showRenewAccessDialog() {
    const existingOverlay = document.getElementById('daf-access-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }

    const overlay = document.createElement('div');
    overlay.id = 'daf-renew-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 999999;
        padding: 20px;
        box-sizing: border-box;
    `;

    overlay.innerHTML = `
        <div style="
            background: white;
            border-radius: 20px;
            max-width: 500px;
            width: 100%;
            max-height: 80vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        ">
            <div style="padding: 30px 40px; overflow-y: auto;">
                <h2 style="color: #667eea; text-align: center; margin: 0 0 15px 0; font-size: 1.6em;">
                    🔑 Zugang erneuern
                </h2>
                
                <p style="text-align: center; color: #666; margin-bottom: 25px; line-height: 1.6;">
                    Gib die Email-Adresse ein, mit der du dich registriert hast. Du erhältst einen neuen Bestätigungslink.
                </p>

                <form id="daf-renew-form">
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Email: *</label>
                        <input type="email" name="email" required placeholder="deine@email.com"
                            style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 1em; box-sizing: border-box;">
                    </div>

                    <button type="submit" style="
                        width: 100%;
                        padding: 15px;
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        color: white;
                        border: none;
                        border-radius: 10px;
                        font-size: 1.1em;
                        font-weight: bold;
                        cursor: pointer;
                        margin-bottom: 15px;
                    ">
                        ✉️ Bestätigungslink senden
                    </button>

                    <button type="button" onclick="closeRenewDialog()" style="
                        width: 100%;
                        padding: 12px;
                        background: transparent;
                        color: #666;
                        border: 2px solid #ddd;
                        border-radius: 8px;
                        font-size: 1em;
                        cursor: pointer;
                    ">
                        ← Zurück
                    </button>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    const renewForm = document.getElementById('daf-renew-form');
    renewForm.addEventListener('submit', handleRenewAccess);
}

function closeRenewDialog() {
    const overlay = document.getElementById('daf-renew-overlay');
    if (overlay) {
        overlay.remove();
        document.body.style.overflow = '';
        showRegistrationDialog();
    }
}

// Registrierung verarbeiten
async function handleRegistration(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    let mitteilungen = formData.get('mitteilungen') || '';
    mitteilungen = mitteilungen.trim();
    
    const linkCount = (mitteilungen.match(/https?:\/\//g) || []).length;
    if (linkCount > 3) {
        alert('Zu viele Links in der Mitteilung. Bitte maximal 3 Links verwenden.');
        return;
    }
    
    if (!mitteilungen) {
        mitteilungen = 'Keine Angabe';
    }
    
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        altersklasse: formData.get('altersklasse'),
        muttersprache: formData.get('muttersprache'),
        koennerstufe: formData.get('koennerstufe'),
        mitteilungen: mitteilungen,
        registration_date: new Date().toLocaleString('de-DE')
    };

    const button = e.target.querySelector('button[type="submit"]');
    const originalText = button.innerHTML;
    button.innerHTML = '⏳ Wird gesendet...';
    button.disabled = true;
    button.style.opacity = '0.7';

    try {
        const confirmationToken = btoa(data.email + Date.now());
        const confirmationLink = window.location.origin + window.location.pathname + 
                                '?confirm=' + confirmationToken + '&email=' + encodeURIComponent(data.email);

        // Email an DICH (Benachrichtigung)
        await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_NOTIFICATION,
            {
                name: data.name,
                email: data.email,
                altersklasse: data.altersklasse,
                muttersprache: data.muttersprache,
                koennerstufe: data.koennerstufe,
                mitteilungen: data.mitteilungen,
                registration_date: data.registration_date
            }
        );

        // Email an NUTZER (Bestätigung)
        await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_USER,
            {
                name: data.name,
                to_email: data.email,
                confirmation_link: confirmationLink
            }
        );

        button.innerHTML = '✅ Email versendet!';
        button.style.background = '#4caf50';
        button.style.opacity = '1';
        
        setTimeout(() => {
            const overlay = document.getElementById('daf-access-overlay');
            overlay.innerHTML = `
                <div style="
                    background: white;
                    padding: 40px;
                    border-radius: 20px;
                    max-width: 500px;
                    width: 90%;
                    text-align: center;
                ">
                    <div style="font-size: 4em; margin-bottom: 20px;">✅</div>
                    <h2 style="color: #4caf50; margin-bottom: 15px;">Email versendet!</h2>
                    <p style="font-size: 1.1em; color: #666; line-height: 1.6;">
                        Bitte prüfe dein Email-Postfach (auch Spam-Ordner).<br><br>
                        Klicke auf den Bestätigungslink in der Email,<br>
                        um deinen Zugang zu aktivieren.
                    </p>
                </div>
            `;
        }, 1500);

    } catch (error) {
        console.error('Fehler beim Versenden:', error);
        button.innerHTML = '❌ Fehler - Bitte erneut versuchen';
        button.style.background = '#f44336';
        button.style.opacity = '1';
        button.disabled = false;
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
        }, 3000);
    }
}

// Zugang erneuern
async function handleRenewAccess(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = formData.get('email');

    const button = e.target.querySelector('button[type="submit"]');
    const originalText = button.innerHTML;
    button.innerHTML = '⏳ Wird gesendet...';
    button.disabled = true;

    try {
        const confirmationToken = btoa(email + Date.now());
        const confirmationLink = window.location.origin + window.location.pathname + 
                                '?confirm=' + confirmationToken + '&email=' + encodeURIComponent(email);

        await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_USER,
            {
                name: 'DAF-Nutzer',
                to_email: email,
                confirmation_link: confirmationLink
            }
        );

        button.innerHTML = '✅ Email versendet!';
        button.style.background = '#4caf50';
        
        setTimeout(() => {
            const overlay = document.getElementById('daf-renew-overlay');
            overlay.innerHTML = `
                <div style="background: white; padding: 40px; border-radius: 20px; max-width: 500px; width: 90%; text-align: center;">
                    <div style="font-size: 4em; margin-bottom: 20px;">✅</div>
                    <h2 style="color: #4caf50; margin-bottom: 15px;">Email versendet!</h2>
                    <p style="font-size: 1.1em; color: #666; line-height: 1.6;">
                        Prüfe dein Email-Postfach und klicke auf den Bestätigungslink.
                    </p>
                </div>
            `;
        }, 1500);

    } catch (error) {
        console.error('Fehler:', error);
        button.innerHTML = '❌ Fehler - Bitte erneut versuchen';
        button.style.background = '#f44336';
        button.disabled = false;
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
        }, 3000);
    }
}

// Bestätigung über URL Parameter - URL sofort bereinigen
function checkConfirmation() {
    const urlParams = new URLSearchParams(window.location.search);
    const confirmToken = urlParams.get('confirm');
    const email = urlParams.get('email');
    
    if (confirmToken && email) {
        localStorage.setItem('daf_access_granted', 'true');
        localStorage.setItem('daf_user_email', email);
        localStorage.setItem('daf_access_date', new Date().toISOString());
        
        // URL sofort bereinigen
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 999999;
            padding: 20px;
        `;
        
        overlay.innerHTML = `
            <div style="background: white; padding: 40px; border-radius: 20px; max-width: 500px; width: 90%; text-align: center;">
                <div style="font-size: 4em; margin-bottom: 20px;">🎉</div>
                <h2 style="color: #4caf50; margin-bottom: 15px;">Zugang aktiviert!</h2>
                <p style="font-size: 1.1em; color: #666; line-height: 1.6; margin-bottom: 25px;">
                    Dein Zugang wurde erfolgreich aktiviert.<br>
                    Du kannst jetzt alle DAF-Materialien nutzen.
                </p>
                <button onclick="location.reload()" style="
                    padding: 15px 30px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 1.1em;
                    font-weight: bold;
                    cursor: pointer;
                ">
                    ➜ Weiter zu den Materialien
                </button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
    }
}

// Hauptfunktion beim Laden der Seite
window.addEventListener('DOMContentLoaded', function() {
    checkConfirmation();
    
    if (!checkAccess()) {
        setTimeout(() => {
            showRegistrationDialog();
        }, 500);
    }
});

// ESC-Taste zum Schließen
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeRenewDialog();
    }
});

// Export für andere Skripte
window.DAFAccessControl = {
    hasAccess: checkAccess,
    getUserEmail: () => localStorage.getItem('daf_user_email'),
    getAccessDate: () => localStorage.getItem('daf_access_date'),
    showRenewDialog: showRenewAccessDialog,
    logout: () => {
        if (confirm('Möchtest du dich wirklich abmelden?')) {
            localStorage.removeItem('daf_access_granted');
            localStorage.removeItem('daf_user_email');
            localStorage.removeItem('daf_access_date');
            location.reload();
        }
    }
};