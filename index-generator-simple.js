// index-generator-simple.js
// Nur für Node.js v14+
// Ausführen mit: node index-generator-simple.js

const https = require('https');
const fs = require('fs');

const BASE_URL = 'https://amyfabijenna.github.io/amylang-deutsch/';
const MAX_PAGES = 500;

const visited = new Set();
const pages = [];

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function extractText(html) {
  // Simple HTML tag removal
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTitle(html) {
  const match = html.match(/<title>([^<]*)<\/title>/i);
  return match ? match[1].trim() : 'Ohne Titel';
}

function extractLinks(html, baseUrl) {
  const links = [];
  const regex = /<a\s+[^>]*href=["']([^"']+)["']/gi;
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    const href = match[1];
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    
    try {
      let fullUrl;
      
      if (href.startsWith('http://') || href.startsWith('https://')) {
        fullUrl = href;
      } else if (href.startsWith('/')) {
        fullUrl = BASE_URL.replace(/\/$/, '') + href;
      } else {
        // WICHTIG: Relative URLs korrekt auflösen
        const baseDir = baseUrl.substring(0, baseUrl.lastIndexOf('/') + 1);
        fullUrl = baseDir + href;
      }
      
      if (fullUrl.startsWith(BASE_URL) && (fullUrl.endsWith('.html') || fullUrl.endsWith('/'))) {
        links.push(fullUrl);
      }
    } catch (e) {
      console.error('Link-Fehler:', href, 'von', baseUrl);
    }
  }
  
  return [...new Set(links)];
}

async function crawlPage(url, depth = 0) {
  if (depth > 5 || visited.has(url) || visited.size >= MAX_PAGES) {
    return;
  }

  console.log(`Crawling (${visited.size + 1}/${MAX_PAGES}): ${url}`);
  visited.add(url);

  try {
    const html = await fetchPage(url);
    const title = extractTitle(html);
    const content = extractText(html).substring(0, 5000);

    pages.push({ url, title, content });

    const links = extractLinks(html, url);
    
    for (const link of links.slice(0, 20)) {
      if (!visited.has(link)) {
        await crawlPage(link, depth + 1);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

  } catch (error) {
    console.error(`Fehler bei ${url}:`, error.message);
  }
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
        topics[topic].push({ title: page.title, url: page.url });
      }
    });
  });

  return topics;
}

async function generateIndex() {
  console.log('========================================');
  console.log('Amy Lang Deutsch - Index Generator');
  console.log('========================================\n');

  await crawlPage(BASE_URL);

  console.log('\n========================================');
  console.log(`Fertig: ${pages.length} Seiten gefunden`);
  console.log('========================================\n');

  const index = {
    generated: new Date().toISOString(),
    baseUrl: BASE_URL,
    totalPages: pages.length,
    pages: pages,
    topics: buildTopicIndex(pages)
  };

  fs.writeFileSync('search-index.json', JSON.stringify(index, null, 2));
  console.log('✓ Index gespeichert: search-index.json');
  console.log(`✓ Größe: ${(fs.statSync('search-index.json').size / 1024).toFixed(2)} KB\n`);
  
  const summary = {
    totalPages: index.totalPages,
    topics: Object.keys(index.topics).map(topic => ({
      name: topic,
      pages: index.topics[topic].length
    }))
  };
  
  console.log('Gefundene Themen:');
  summary.topics.forEach(t => console.log(`  ${t.name}: ${t.pages} Seiten`));
}

generateIndex().catch(console.error);