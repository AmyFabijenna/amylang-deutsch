/* Passwort-Schleuse für alle Übungsseiten im Ordner interdaf – mit Monatspasswörtern.
   Die Passwörter stehen hier nur als verschlüsselter Fingerabdruck (SHA-256),
   niemand kann sie aus dieser Datei herauslesen.
   Am 1. jedes Monats gilt automatisch das neue Passwort; wer noch das alte hat,
   wird wieder gefragt. Gibt es für einen Monat keinen Eintrag, gilt der letzte. */
(function () {
  var PASSWOERTER = {
    "2026-10": "6815f3c300383519de8e437497e2c3e97852fe8d717a5419d5aafb00cb43c494",
    "2026-11": "64f29c9ba3ea53e9fddd5525969c8d653362a49f486483d4085311cdcaef3308",
    "2026-12": "d7ecf72989262b02417ca68b67721ec061d9f69e7c12ba265e11f401f0371e46",
    "2027-01": "1b4c9133da73a711322404314402765ab0d23fd362a167d6f0c65bb215113d94",
    "2027-02": "98a4f7655958a385a0667bad61bac1b10f31df5f39eb57e06527dc1949acaf18",
    "2027-03": "06a4b0444ae1e6183e2e344f1dd1159373f6f2168213fe4d729b98d2079a17cc",
    "2027-04": "ed395599934e1cea771ff87b7296da2d0e0dea998610cfff6fb4ac6780afcc9e",
    "2027-05": "0b92634241a6e3859dfacff28f35c7a9b286ea35b8c2c1994de3c18abd5b3cc9",
    "2027-06": "f46b54b43c684b109d5356e48ec582b0659ceacb5e3e8f7e0133f97e7d9d7af1",
    "2027-07": "3ff468f75b48c2b419051676615aafd4c82862337c9b0ee77cedb2eeebf92232",
    "2027-08": "cfe33ee427523d0a0f82c3d0daa57f14f8c4fcbc356a73802ee279b7c3d2bcf2",
    "2027-09": "75d032b940a5cfa8d0ec0c472e874156392ead6d1cb7c03bf6ea7fb14bb3700f",
    "2027-10": "ef56f6725200005f77c6c0306228d004c136ce7a6cb6e423d6385d8acf4c4abc",
    "2027-11": "98a9c7c855a6677582a3ef80e35ad3fc852f203ff0c6cd4c423ec1faa4c1c433",
    "2027-12": "e8298542358283d3f0957aefe5a81a246b3adf1abdd00dfb5b7f64bb0ba29296"
  };
  var SCHLUESSEL = "interdaf-zugang";

  function aktuellerFingerabdruck() {
    var d = new Date();
    var jetzt = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
    var monate = Object.keys(PASSWOERTER).sort();
    var gueltig = monate[0];
    for (var i = 0; i < monate.length; i++) { if (monate[i] <= jetzt) gueltig = monate[i]; }
    return PASSWOERTER[gueltig];
  }
  var SOLL = aktuellerFingerabdruck();

  function freigegeben() {
    try { return localStorage.getItem(SCHLUESSEL) === SOLL; } catch (e) { return false; }
  }
  if (freigegeben()) return;

  function fingerabdruck(text) {
    var daten = new TextEncoder().encode(text.trim().toLowerCase());
    return crypto.subtle.digest("SHA-256", daten).then(function (puffer) {
      return Array.from(new Uint8Array(puffer)).map(function (b) {
        return b.toString(16).padStart(2, "0");
      }).join("");
    });
  }

  var html = document.documentElement;
  html.classList.add("pw-gesperrt");

  var schrift = document.createElement("link");
  schrift.rel = "stylesheet";
  schrift.href = "https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600&display=swap";
  document.head.appendChild(schrift);

  var stil = document.createElement("style");
  stil.textContent =
    "html.pw-gesperrt body > *:not(#pw-schleuse){display:none !important}" +
    "html.pw-gesperrt body{overflow:hidden}" +
    "#pw-schleuse{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;" +
    "padding:16px;background:linear-gradient(160deg,#e9eef2 0%,#e6ecea 55%,#ece8f0 100%);font-family:'Lexend',system-ui,sans-serif}" +
    "#pw-schleuse .pw-karte{background:#fff;border-radius:24px;padding:38px 28px;max-width:420px;width:100%;" +
    "box-shadow:0 12px 34px rgba(36,58,82,.14);text-align:center;color:#1b1b1b}" +
    "#pw-schleuse .pw-symbol{width:64px;height:64px;margin:0 auto 18px;border-radius:50%;background:#2e6f73;" +
    "display:flex;align-items:center;justify-content:center}" +
    "#pw-schleuse h1{font-size:1.6rem;font-weight:600;color:#2f4a68;margin:0 0 10px}" +
    "#pw-schleuse p{font-size:1.08rem;line-height:1.55;margin:0 0 22px;color:#2b2b2b}" +
    "#pw-schleuse input{width:100%;box-sizing:border-box;font:inherit;font-size:1.2rem;padding:14px 16px;" +
    "border:2px solid #c8d2da;border-radius:14px;outline:none;text-align:center;color:#1b1b1b;background:#fafbfc}" +
    "#pw-schleuse input:focus{border-color:#2e6f73}" +
    "#pw-schleuse button{margin-top:14px;width:100%;font:inherit;font-size:1.15rem;font-weight:500;padding:14px;" +
    "border:none;border-radius:14px;background:#2e6f73;color:#fff;cursor:pointer}" +
    "#pw-schleuse button:hover{background:#265e62}" +
    "#pw-schleuse .pw-fehler{min-height:1.5em;margin-top:14px;font-size:1rem;color:#6a4878}";
  document.head.appendChild(stil);

  function schleuseBauen() {
    var box = document.createElement("div");
    box.id = "pw-schleuse";
    box.innerHTML =
      '<form class="pw-karte" autocomplete="off">' +
        '<div class="pw-symbol"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2.5"/>' +
        '<path d="M8 11V7.5a4 4 0 0 1 8 0V11"/></svg></div>' +
        '<h1>Übungsbereich</h1>' +
        '<p>Bitte gib das Passwort dieses Monats ein, das du im Unterricht bekommen hast.</p>' +
        '<input type="password" aria-label="Passwort" placeholder="Passwort">' +
        '<button type="submit">Öffnen</button>' +
        '<div class="pw-fehler" aria-live="polite"></div>' +
      '</form>';
    document.body.appendChild(box);

    var form = box.querySelector("form");
    var feld = box.querySelector("input");
    var fehler = box.querySelector(".pw-fehler");
    feld.focus();

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      fingerabdruck(feld.value).then(function (wert) {
        if (wert === SOLL) {
          try { localStorage.setItem(SCHLUESSEL, SOLL); } catch (err) {}
          box.remove();
          html.classList.remove("pw-gesperrt");
        } else {
          fehler.textContent = "Das stimmt leider nicht – vielleicht gilt schon das Passwort des neuen Monats?";
          feld.value = "";
          feld.focus();
        }
      });
    });
  }

  if (document.body) schleuseBauen();
  else document.addEventListener("DOMContentLoaded", schleuseBauen);
})();
