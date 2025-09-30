// ========================================
// DAF ACCESS CONTROL SYSTEM
// Für geschützte Seiten mit EmailJS
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

// Registrierungsdialog anzeigen
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
        overflow-y: auto;
        padding: 20px 0;
    `;

    overlay.innerHTML = `
        <div style="
            background: white;
            padding: 40px;
            border-radius: 20px;
            max-width: 550px;
            width: 90%;
            margin: 20px auto;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        ">
            <h2 style="color: #667eea; text-align: center; margin-bottom: 20px; font-size: 1.8em;">
                🔐 Zugang zu Amys Deutsch/DAF-Materialien
            </h2>
            
            <p style="text-align: center; color: #666; margin-bottom: 25px; line-height: 1.6;">
                Registriere dich einmalig für dauerhaften Zugang zu allen Lernmaterialien
            </p>

            <form id="daf-registration-form">
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Name: *</label>
                    <input type="text" name="name" required placeholder="Dein vollständiger Name"
                        style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 1em; box-sizing: border-box;">
                </div>

                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Email: *</label>
                    <input type="email" name="email" required placeholder="deine@email.com"
                        style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 1em; box-sizing: border-box;">
                </div>

                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Altersklasse: *</label>
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
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Muttersprache: *</label>
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
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Könnerstufe Deutsch: *</label>
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

                <div style="margin-bottom: 25px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">
                        Wünsche / Mitteilungen:
                        <span style="font-weight: normal; color: #888; font-size: 0.9em;">(optional)</span>
                    </label>
                    <textarea name="mitteilungen" rows="4" 
                        placeholder="Hast du spezielle Lernziele oder Wünsche? Lass es uns wissen..."
                        style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 1em; box-sizing: border-box; resize: vertical; font-family: inherit;"></textarea>
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
                ">
                    ✉️ Registrierung absenden
                </button>
            </form>

            <p style="margin-top: 20px; font-size: 0.9em; text-align: center; color: #666; line-height: 1.6;">
                Du erhältst eine Email mit einem Bestätigungslink.<br>
                Nach der Bestätigung hast du dauerhaften Zugang.
            </p>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    // Form Handler
    document.getElementById('daf-registration-form').addEventListener('submit', handleRegistration);
}

// Registrierung verarbeiten
async function handleRegistration(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        altersklasse: formData.get('altersklasse'),
        muttersprache: formData.get('muttersprache'),
        koennerstufe: formData.get('koennerstufe'),
        mitteilungen: formData.get('mitteilungen') || 'Keine Angabe',
        registration_date: new Date().toLocaleString('de-DE')
    };

    // Button deaktivieren
    const button = e.target.querySelector('button');
    const originalText = button.innerHTML;
    button.innerHTML = '⏳ Wird gesendet...';
    button.disabled = true;
    button.style.opacity = '0.7';

    try {
        // Bestätigungslink generieren
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

        // Erfolg anzeigen
        button.innerHTML = '✅ Email versendet!';
        button.style.background = '#4caf50';
        button.style.opacity = '1';
        
        setTimeout(() => {
            const overlay = document.getElementById('daf-access-overlay');
            overlay.innerHTML = `
                <div style="background: white; padding: 40px; border-radius: 20px; max-width: 500px; width: 90%; margin: 20px; text-align: center;">
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

// Bestätigung über URL Parameter
function checkConfirmation() {
    const urlParams = new URLSearchParams(window.location.search);
    const confirmToken = urlParams.get('confirm');
    const email = urlParams.get('email');
    
    if (confirmToken && email) {
        // Zugang gewähren
        localStorage.setItem('daf_access_granted', 'true');
        localStorage.setItem('daf_user_email', email);
        localStorage.setItem('daf_access_date', new Date().toISOString());
        
        // Erfolgs-Overlay anzeigen
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
        `;
        
        overlay.innerHTML = `
            <div style="background: white; padding: 40px; border-radius: 20px; max-width: 500px; width: 90%; margin: 20px; text-align: center;">
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
        
        // URL bereinigen nach 3 Sekunden
        setTimeout(() => {
            const cleanUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
        }, 3000);
    }
}

// Hauptfunktion beim Laden der Seite
window.addEventListener('DOMContentLoaded', function() {
    // Prüfe zuerst auf Bestätigungslink
    checkConfirmation();
    
    // Wenn kein Zugang, zeige Registrierung
    if (!checkAccess()) {
        // Warte kurz, damit die Seite sichtbar ist
        setTimeout(() => {
            showRegistrationDialog();
        }, 500);
    }
});

// Export für andere Skripte
window.DAFAccessControl = {
    hasAccess: checkAccess,
    getUserEmail: () => localStorage.getItem('daf_user_email'),
    getAccessDate: () => localStorage.getItem('daf_access_date'),
    logout: () => {
        if (confirm('Möchtest du dich wirklich abmelden?')) {
            localStorage.removeItem('daf_access_granted');
            localStorage.removeItem('daf_user_email');
            localStorage.removeItem('daf_access_date');
            location.reload();
        }
    }
};