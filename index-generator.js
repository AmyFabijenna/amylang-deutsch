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
    'Adjektive': ['adjektiv', 'eigenschaftswort', 'steigerung', 'komparativ', 'superlativ'],
    'Verben': ['verb', 'zeitwort', 'konjugation', 'präsens', 'präteritum', 'perfekt'],
    'Substantive': ['substantiv', 'nomen', 'hauptwort', 'deklination', 'kasus'],
    'Präpositionen': ['präposition', 'verhältniswort', 'dativ', 'akkusativ', 'genitiv'],
    'Pronomen': ['pronomen', 'fürwort', 'personalpronomen', 'possessivpronomen'],
    'Satzlehre': ['satz', 'hauptsatz', 'nebensatz', 'syntax', 'satzglieder'],
    'Rechtschreibung': ['rechtschreibung', 'orthografie', 'groß', 'klein', 'komma'],
    'Wortarten': ['wortart', 'grammatik', 'partikel', 'konjunktion'],
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
        current[part] = idx === parts.length - 1 ? page : {};
      }
      current = current[part];
    });
  });

  return structure;
}

async function generateIndex() {
  console.log('Starte Crawling...');
  console.log('Basis-URL:', BASE_URL);
  console.log('Max. Seiten:', MAX_PAGES);
  console.log('Max. Tiefe:', MAX_DEPTH);
  console.log('---');

  await crawlPage(BASE_URL);

  console.log('---');
  console.log(`Crawling abgeschlossen: ${pages.length} Seiten gefunden`);
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
    }))
  };
  
  fs.writeFileSync('index-summary.json', JSON.stringify(summary, null, 2));
  console.log('✓ Zusammenfassung gespeichert in: index-summary.json');
  console.log('');
  console.log('Gefundene Themen:');
  summary.topics.forEach(topic => {
    console.log(`  - ${topic.name}: ${topic.pages} Seiten`);
  });
}

// Run the generator
generateIndex().catch(console.error);