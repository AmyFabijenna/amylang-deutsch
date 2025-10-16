(function() {
    // HIER DAS PASSWORT ÄNDERN:
    const KORREKTES_PASSWORT = "Nabiha2025";
    
    // Prüfen ob bereits eingeloggt
    const isLoggedIn = sessionStorage.getItem('daf_access') === 'granted';
    
    if (!isLoggedIn) {
        // Passwort abfragen
        const eingabe = prompt("Diese Seite ist geschützt.\nBitte Passwort eingeben:");
        
        if (eingabe === KORREKTES_PASSWORT) {
            // Korrekt - Zugriff gewähren
            sessionStorage.setItem('daf_access', 'granted');
        } else {
            // Falsch - Seite blockieren
            alert("Falsches Passwort! Zugriff verweigert.");
            document.body.innerHTML = '<div style="text-align:center; padding:50px; font-family:Arial;"><h1>🔒 Zugriff verweigert</h1><p>Falsches Passwort.</p></div>';
            throw new Error("Zugriff verweigert");
        }
    }
})();