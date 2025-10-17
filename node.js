// index-generator.js
// Dieses Script lokal ausführen mit: node index-generator.js
// Benötigt: npm install node-fetch jsdom

const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const fs = require('fs');

const BASE_URL = 'https://amyfabijenna.github.io/amylang-deutsch/';
const MAX_PAGES = 1000;
const MAX_DEPTH = 10;

const visited = new Set();
const pages = [];

async function crawlPage(url, depth = 0) {
  if (depth > MAX_DEPTH || visited.has(url) || visited.size >= MAX_PAGES) {
    return;
  }

  console.log(`Crawling (${visited.size + 1}/${MAX_PAGES}): ${url}`);
  visited.add(url);

  try {
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    // Extract page data
    const title = doc.title || 'Ohne Titel';
    const bodyText = doc.body.textContent
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 5000); // Limit content size

    // Extract keywords from title and content
    const keywords = extractKeywords(title + ' ' + bodyText);

    pages.push({
      url,
      title,
      content: bodyText,
      keywords,
      depth
    });

    // Find internal links
    const links = Array.from(doc.querySelectorAll('a[href]'))
      .map(a => {
        const href = a.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
          return null;
        }
        try {
          const fullUrl = new URL(href, url).href;
          return fullUrl.startsWith(BASE_URL) ? fullUrl : null;
        } catch {
          return null;
        }
      })
      .filter(link => link && !visited.has(link));

    // Crawl found links
    for (const link of links) {
      await crawlPage(link, depth + 1);
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

  } catch (error) {
    console.error(`Fehler beim Crawlen von ${url}:`, error.message);
  }
}

function extractKeywords(text) {
  const words = text.toLowerCase()
    .replace(/[^\wäöüß\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  const frequency = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  // Return top 20 most frequent words
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
}

function buildTopicIndex(pages) {
  const topics = {};
  
  const topicKeywords = {
    'Adjektive': ['adjektiv', 'eigenschaftswort', 'steigerung', 'komparativ', 'superlativ', 'deklination'],
    'Verben': ['verb', 'zeitwort', 'konjugation', 'präsens', 'präteritum', 'perfekt', 'plusquamperfekt', 'futur'],
    'Substantive': ['substantiv', 'nomen', 'hauptwort', 'deklination', 'kasus', 'genus', 'artikel'],
    'Präpositionen': ['präposition', 'verhältniswort', 'dativ', 'akkusativ', 'genitiv', 'wechselpräposition'],
    'Pronomen': ['pronomen', 'fürwort', 'personalpronomen', 'possessivpronomen', 'demonstrativpronomen', 'relativpronomen'],
    'Satzlehre': ['satz', 'hauptsatz', 'nebensatz', 'syntax', 'satzglieder', 'subjekt', 'prädikat', 'objekt'],
    'Rechtschreibung': ['rechtschreibung', 'orthografie', 'groß', 'klein', 'komma', 'zeichensetzung', 'silbentrennung'],
    'Wortarten': ['wortart', 'grammatik', 'partikel', 'konjunktion', 'adverb', 'numerale'],
    'Zeitformen': ['tempus', 'zeitform', 'präsens', 'präteritum', 'perfekt', 'plusquamperfekt', 'futur'],
    'Konjunktiv': ['konjunktiv', 'möglichkeitsform', 'indirekte', 'rede', 'irrealis'],
    'Passiv': ['passiv', 'vorgangspassiv', 'zustandspassiv', 'leideform'],
    'Artikel': ['artikel', 'geschlechtswort', 'bestimmt', 'unbestimmt', 'der', 'die', 'das'],
    'Satzbau': ['satzbau', 'wortstellung', 'inversion', 'satzklammer', 'feldstruktur'],
    'Textarten': ['text', 'aufsatz', 'beschreibung', 'bericht', 'erörterung', 'interpretation'],
  };

  pages.forEach(page => {
    const content = (page.title + ' ' + page.content).toLowerCase();
    
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => content.includes(keyword))) {
        if (!topics[topic]) topics[topic] = [];
        topics[topic].push({
          title: page.title,
          url: page.url
        });
      }
    });
  });

  // Remove duplicates
  Object.keys(topics).forEach(topic => {
    const seen = new Set();
    topics[topic] = topics[topic].filter(page => {
      if (seen.has(page.url)) return false;
      seen.add(page.url);
      return true;
    });
  });

  return topics;
}

function buildStructureIndex(pages) {
  const structure = {};
  
  pages.forEach(page => {
    const urlPath = page.url.replace(BASE_URL, '');
    const parts = urlPath.split('/').filter(p => p);
    
    let current = structure;
    parts.forEach((part, idx) => {
      if (!current[part]) {
        current[part] = idx === parts.length - 1 ? { _page: page } : {};
      }
      if (idx < parts.length - 1) {
        current = current[part];
      }
    });
  });

  return structure;
}

async function generateIndex() {
  console.log('========================================');
  console.log('Amy Lang Deutsch - Index Generator');
  console.log('========================================');
  console.log('Basis-URL:', BASE_URL);
  console.log('Max. Seiten:', MAX_PAGES);
  console.log('Max. Tiefe:', MAX_DEPTH);
  console.log('========================================\n');

  const startTime = Date.now();

  await crawlPage(BASE_URL);

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n========================================');
  console.log(`Crawling abgeschlossen: ${pages.length} Seiten in ${duration}s`);
  console.log('========================================\n');
  console.log('Erstelle Indizes...');

  const index = {
    generated: new Date().toISOString(),
    baseUrl: BASE_URL,
    totalPages: pages.length,
    pages: pages,
    topics: buildTopicIndex(pages),
    structure: buildStructureIndex(pages)
  };

  // Save to file
  fs.writeFileSync('search-index.json', JSON.stringify(index, null, 2));
  console.log('✓ Index gespeichert in: search-index.json');
  console.log(`✓ Dateigröße: ${(fs.statSync('search-index.json').size / 1024).toFixed(2)} KB`);
  
  // Save summary
  const summary = {
    generated: index.generated,
    totalPages: index.totalPages,
    topics: Object.keys(index.topics).map(topic => ({
      name: topic,
      pages: index.topics[topic].length
    })).sort((a, b) => b.pages - a.pages)
  };
  
  fs.writeFileSync('index-summary.json', JSON.stringify(summary, null, 2));
  console.log('✓ Zusammenfassung gespeichert in: index-summary.json\n');
  
  console.log('========================================');
  console.log('Gefundene Themen:');
  console.log('========================================');
  summary.topics.forEach(topic => {
    console.log(`  ${topic.name.padEnd(20)} ${topic.pages} Seiten`);
  });
  console.log('========================================\n');
  console.log('✓ Fertig! Lade "search-index.json" auf deine Webseite hoch.');
  console.log('========================================');
}

// Run the generator
generateIndex().catch(error => {
  console.error('FEHLER:', error);
  process.exit(1);
});