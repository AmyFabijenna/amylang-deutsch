import React, { useState, useEffect, useRef } from 'react';
import { Search, BookOpen, Filter, Loader, ChevronRight, ChevronDown, Zap, Database } from 'lucide-react';

const AmyLangSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState('quick'); // 'quick' or 'full'
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchIndex, setSearchIndex] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useState('search'); // 'search', 'structure', 'topics'
  const [siteStructure, setSiteStructure] = useState(null);
  const [topicGroups, setTopicGroups] = useState({});
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const searchInputRef = useRef(null);

  // Keyboard shortcut (Ctrl+K) to open modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowModal(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      if (e.key === 'Escape') {
        setShowModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load search index
  useEffect(() => {
    fetch('/search-index.json')
      .then(res => res.json())
      .then(data => setSearchIndex(data))
      .catch(() => console.log('Kein Index gefunden - nur Vollsuche verfügbar'));
  }, []);

  // Quick search using pre-built index
  const quickSearch = (term) => {
    if (!searchIndex || !term.trim()) {
      setResults([]);
      return;
    }

    const lowerTerm = term.toLowerCase();
    const matches = [];

    searchIndex.pages.forEach(page => {
      const titleMatch = page.title.toLowerCase().includes(lowerTerm);
      const contentMatch = page.content.toLowerCase().includes(lowerTerm);
      
      if (titleMatch || contentMatch) {
        const snippet = extractSnippet(page.content, lowerTerm);
        matches.push({
          title: page.title,
          url: page.url,
          snippet: snippet,
          relevance: titleMatch ? 100 : 50
        });
      }
    });

    matches.sort((a, b) => b.relevance - a.relevance);
    setResults(matches.slice(0, 50));
  };

  // Full crawl search
  const fullSearch = async (term) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const baseUrl = 'https://amyfabijenna.github.io/amylang-deutsch/';
    const visited = new Set();
    const matches = [];
    const queue = [baseUrl];

    const crawl = async (url, depth = 0) => {
      if (depth > 5 || visited.has(url) || visited.size > 500) return;
      visited.add(url);

      try {
        const response = await fetch(url);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const title = doc.title || 'Ohne Titel';
        const bodyText = doc.body.innerText || '';
        
        const lowerTerm = term.toLowerCase();
        if (title.toLowerCase().includes(lowerTerm) || bodyText.toLowerCase().includes(lowerTerm)) {
          const snippet = extractSnippet(bodyText, lowerTerm);
          matches.push({
            title,
            url,
            snippet,
            relevance: title.toLowerCase().includes(lowerTerm) ? 100 : 50
          });
        }

        // Find internal links
        const links = Array.from(doc.querySelectorAll('a[href]'))
          .map(a => {
            const href = a.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return null;
            try {
              return new URL(href, url).href;
            } catch {
              return null;
            }
          })
          .filter(link => link && link.startsWith(baseUrl));

        // Crawl found links
        for (const link of links.slice(0, 20)) {
          if (!visited.has(link)) {
            queue.push(link);
          }
        }
      } catch (error) {
        console.error(`Fehler beim Crawlen von ${url}:`, error);
      }
    };

    // Process queue
    while (queue.length > 0 && visited.size < 500) {
      const url = queue.shift();
      await crawl(url, 0);
    }

    matches.sort((a, b) => b.relevance - a.relevance);
    setResults(matches.slice(0, 50));
    setIsSearching(false);
  };

  // Extract snippet around search term
  const extractSnippet = (text, term) => {
    const lowerText = text.toLowerCase();
    const lowerTerm = term.toLowerCase();
    const index = lowerText.indexOf(lowerTerm);
    
    if (index === -1) return text.substring(0, 150) + '...';
    
    const start = Math.max(0, index - 60);
    const end = Math.min(text.length, index + term.length + 90);
    const snippet = text.substring(start, end);
    
    return (start > 0 ? '...' : '') + snippet + (end < text.length ? '...' : '');
  };

  // Highlight search term in snippet
  const highlightTerm = (text, term) => {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? <mark key={i} className="bg-yellow-200 font-semibold">{part}</mark> : part
    );
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (searchMode === 'quick' && searchIndex) {
      quickSearch(term);
    } else {
      if (term.length >= 3) {
        fullSearch(term);
      }
    }
  };

  // Build site structure for navigation
  const buildStructure = async () => {
    setIsSearching(true);
    const baseUrl = 'https://amyfabijenna.github.io/amylang-deutsch/';
    const visited = new Set();
    const structure = { title: 'Hauptseite', url: baseUrl, children: [] };
    
    // This is a simplified version - in production you'd want a more sophisticated crawler
    setIsSearching(false);
    setSiteStructure(structure);
  };

  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const SearchInterface = () => (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSearchMode('quick')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            searchMode === 'quick' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          disabled={!searchIndex}
        >
          <Zap size={18} />
          Schnellsuche
        </button>
        <button
          onClick={() => setSearchMode('full')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            searchMode === 'full' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Database size={18} />
          Vollständige Suche
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          ref={searchInputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={searchMode === 'quick' ? 'Schnellsuche... (z.B. "Adjektive")' : 'Vollständige Suche... (min. 3 Zeichen)'}
          className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
        />
      </div>

      {isSearching && (
        <div className="flex items-center justify-center py-8">
          <Loader className="animate-spin text-blue-600" size={32} />
          <span className="ml-3 text-gray-600">Durchsuche Seiten...</span>
        </div>
      )}

      <div className="space-y-3">
        {results.map((result, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
            <a href={result.url} target="_blank" rel="noopener noreferrer" className="block">
              <h3 className="text-lg font-semibold text-blue-600 hover:underline mb-1">
                {result.title}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{result.url}</p>
              <p className="text-gray-700">
                {highlightTerm(result.snippet, searchTerm)}
              </p>
            </a>
          </div>
        ))}
      </div>

      {searchTerm && results.length === 0 && !isSearching && (
        <div className="text-center py-8 text-gray-500">
          Keine Ergebnisse gefunden für "{searchTerm}"
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Amy Lang Deutsch Suche</h1>
        <p className="text-gray-600 mb-4">
          Durchsuche alle Grammatik- und Textmaterialien • Drücke <kbd className="px-2 py-1 bg-gray-200 rounded">Strg+K</kbd> für Schnellzugriff
        </p>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setView('search')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              view === 'search' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Search size={18} />
            Suche
          </button>
          <button
            onClick={() => setView('structure')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              view === 'structure' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter size={18} />
            Nach Struktur
          </button>
          <button
            onClick={() => setView('topics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              view === 'topics' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BookOpen size={18} />
            Nach Themen
          </button>
        </div>

        {view === 'search' && <SearchInterface />}
        
        {view === 'structure' && (
          <div className="text-gray-600 py-8 text-center">
            Strukturansicht: Hier erscheint die Ordnerstruktur der Seite
          </div>
        )}
        
        {view === 'topics' && (
          <div className="text-gray-600 py-8 text-center">
            Themenansicht: Hier erscheinen alle Inhalte gruppiert nach Themen (Adjektive, Verben, etc.)
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-3xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <SearchInterface />
          </div>
        </div>
      )}
    </div>
  );
};

export default AmyLangSearch;