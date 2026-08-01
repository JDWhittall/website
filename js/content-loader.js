/**
 * Lightweight content helpers for GitHub Pages.
 * Loads JSON from /data/*.json and fills elements with data-content attributes.
 *
 * Usage:
 *   <div data-content="home.headline"></div>
 *   <ul data-list="skills" data-list-template="#skill-item"></ul>
 *   ContentLoader.load('projects').then(...)
 */
(function (global) {
  var cache = {};
  var indexPromise = null;

  function resolveDataUrl(collectionSlug) {
    return indexPromise.then(function (index) {
      if (index && index.collections) {
        for (var i = 0; i < index.collections.length; i++) {
          if (index.collections[i].slug === collectionSlug) {
            return '/' + index.collections[i].path.replace(/^\//, '');
          }
        }
      }
      return '/data/' + collectionSlug + '.json';
    });
  }

  function loadIndex() {
    if (!indexPromise) {
      indexPromise = fetch('/data/index.json')
        .then(function (r) {
          return r.ok ? r.json() : null;
        })
        .catch(function () {
          return null;
        });
    }
    return indexPromise;
  }

  function load(collectionSlug) {
    if (cache[collectionSlug]) return Promise.resolve(cache[collectionSlug]);
    return loadIndex()
      .then(function () {
        return resolveDataUrl(collectionSlug);
      })
      .then(function (url) {
        return fetch(url).then(function (r) {
          if (!r.ok) throw new Error('Failed to load ' + url + ' (' + r.status + ')');
          return r.json();
        });
      })
      .then(function (data) {
        cache[collectionSlug] = data;
        return data;
      });
  }

  function getBySlug(collectionSlug, slug) {
    return load(collectionSlug).then(function (data) {
      if (Array.isArray(data)) {
        for (var i = 0; i < data.length; i++) {
          if (data[i] && data[i].slug === slug) return data[i];
        }
        return null;
      }
      if (data && typeof data === 'object') {
        if (data[slug]) return data[slug];
        if (data.slug === slug) return data;
      }
      return null;
    });
  }

  function getPath(obj, path) {
    if (!path) return obj;
    var parts = path.split('.');
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** Minimal markdown: headings, bold, italic, paragraphs, line breaks */
  function renderMarkdown(src) {
    if (src == null) return '';
    var s = String(src);
    // If marked is available (CDN), use it
    if (global.marked && typeof global.marked.parse === 'function') {
      return global.marked.parse(s);
    }
    s = escapeHtml(s);
    s = s.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    s = s.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    s = s.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
    s = s
      .split(/\n\n+/)
      .map(function (block) {
        if (/^<h[1-3]>/.test(block)) return block;
        return '<p>' + block.replace(/\n/g, '<br>') + '</p>';
      })
      .join('\n');
    return s;
  }

  function paragraphsToHtml(value) {
    if (Array.isArray(value)) {
      return value.map(function (p) {
        return '<p>' + escapeHtml(p).replace(/\n/g, '<br>') + '</p>';
      }).join('');
    }
    if (typeof value === 'string') {
      return value
        .split(/\n\n+/)
        .map(function (p) {
          return '<p>' + escapeHtml(p).replace(/\n/g, '<br>') + '</p>';
        })
        .join('');
    }
    return escapeHtml(value == null ? '' : value);
  }

  function setElementContent(el, value, mode) {
    if (value == null) {
      el.textContent = '';
      return;
    }
    if (mode === 'markdown') {
      el.innerHTML = renderMarkdown(value);
    } else if (mode === 'html') {
      el.innerHTML = String(value);
    } else if (mode === 'paragraphs') {
      el.innerHTML = paragraphsToHtml(value);
    } else if (mode === 'src' && el.tagName === 'IMG') {
      el.src = String(value);
    } else if (mode === 'href' && el.tagName === 'A') {
      el.href = String(value);
    } else if (Array.isArray(value)) {
      el.textContent = value.join(', ');
    } else {
      el.textContent = String(value);
    }
  }

  /**
   * data-content="collection.path.to.field"
   * data-content-mode="text|markdown|html|paragraphs|src|href"
   */
  function fill(root) {
    var scope = root || document;
    var nodes = scope.querySelectorAll('[data-content]');
    var jobs = [];
    nodes.forEach(function (el) {
      var expr = el.getAttribute('data-content') || '';
      var parts = expr.split('.');
      var collection = parts.shift();
      var fieldPath = parts.join('.');
      var mode = el.getAttribute('data-content-mode') || 'text';
      if (!collection) return;
      jobs.push(
        load(collection).then(function (data) {
          setElementContent(el, getPath(data, fieldPath), mode);
        })
      );
    });

    var listNodes = scope.querySelectorAll('[data-list]');
    listNodes.forEach(function (el) {
      var collection = el.getAttribute('data-list');
      var itemKey = el.getAttribute('data-list-item') || 'name';
      var mode = el.getAttribute('data-list-mode') || 'li';
      jobs.push(
        load(collection).then(function (data) {
          var items = Array.isArray(data) ? data : Object.keys(data || {}).map(function (k) {
            return data[k];
          });
          el.innerHTML = '';
          items.forEach(function (item) {
            var label =
              typeof item === 'string'
                ? item
                : item[itemKey] != null
                  ? item[itemKey]
                  : item.title || item.name || JSON.stringify(item);
            if (mode === 'li') {
              var li = document.createElement('li');
              li.textContent = label;
              el.appendChild(li);
            } else {
              var span = document.createElement('span');
              span.className = 'content-list-item';
              span.textContent = label;
              el.appendChild(span);
            }
          });
        })
      );
    });

    return Promise.all(jobs);
  }

  function clearCache() {
    cache = {};
    indexPromise = null;
  }

  global.ContentLoader = {
    load: load,
    getBySlug: getBySlug,
    fill: fill,
    renderMarkdown: renderMarkdown,
    paragraphsToHtml: paragraphsToHtml,
    clearCache: clearCache,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      fill(document);
    });
  } else {
    fill(document);
  }
})(typeof window !== 'undefined' ? window : globalThis);
