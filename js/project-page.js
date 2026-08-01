/**
 * Fills the shared project page template using window.PROJECT_SLUG and data/projects.json
 */
(function () {
  function setText(id, value) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = value == null ? '' : String(value);
  }

  function setHtml(id, html) {
    var el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = html || '';
  }

  function setImg(id, src, alt) {
    var el = document.getElementById(id);
    if (!el) return;
    if (!src) {
      el.style.display = 'none';
      return;
    }
    el.style.display = '';
    el.src = resolveAsset(src);
    if (alt) el.alt = alt;
  }

  function resolveAsset(src) {
    if (!src) return '';
    if (/^https?:\/\//i.test(src) || src.startsWith('/')) return src;
    // Project pages live at /projects/games/{slug}/ so resources need ../../
    if (src.startsWith('resources/')) return '../../' + src;
    return src;
  }

  function paragraphsHtml(text) {
    if (!text) return '';
    if (window.ContentLoader && ContentLoader.paragraphsToHtml) {
      return ContentLoader.paragraphsToHtml(text);
    }
    return String(text)
      .split(/\n\n+/)
      .map(function (p) {
        return '<p>' + p.replace(/</g, '&lt;').replace(/\n/g, '<br>') + '</p>';
      })
      .join('');
  }

  function renderProject(project) {
    if (!project) {
      setHtml('project-info-body', '<p>Project not found.</p>');
      return;
    }

    setText('project-title', project.title || project.slug || '');
    if (project.title) document.title = project.title + ' — JDWhittall';

    setImg('project-cover', project.cover_image, project.title || '');

    var trailer = document.getElementById('project-trailer');
    if (trailer) {
      if (project.trailer_embed) {
        trailer.style.display = '';
        trailer.innerHTML = project.trailer_embed;
      } else {
        trailer.style.display = 'none';
        trailer.innerHTML = '';
      }
    }

    setHtml('project-info-body', paragraphsHtml(project.info));
    setHtml('project-about-body', paragraphsHtml(project.about));

    var play = document.getElementById('project-play-links');
    if (play) {
      play.innerHTML = '';
      var links = project.play_links || [];
      links.forEach(function (link) {
        var a = document.createElement('a');
        a.href = link.url || '#';
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.style.cssText =
          'border-radius: 25px; text-align: center; vertical-align: middle; padding:2%; margin-bottom: 10%; display:inline-block;';
        if (link.badge_image) {
          var img = document.createElement('img');
          img.className = 'image';
          img.src = resolveAsset(link.badge_image);
          img.alt = link.label || 'Play';
          img.style.cssText = 'height:128px; width: auto; border-radius: 25px;';
          a.appendChild(img);
        } else {
          a.textContent = link.label || link.url || 'Play';
        }
        play.appendChild(a);
      });
    }

    var gallery = document.getElementById('project-gallery');
    if (gallery) {
      gallery.innerHTML = '';
      (project.gallery || []).forEach(function (src) {
        var img = document.createElement('img');
        img.className = 'image';
        img.src = resolveAsset(src);
        img.alt = '';
        img.style.cssText = 'margin:20px; width:45%;';
        gallery.appendChild(img);
      });
    }
  }

  function boot() {
    var slug = window.PROJECT_SLUG;
    if (!slug) {
      console.warn('project-page.js: window.PROJECT_SLUG is not set');
      return;
    }

    function run() {
      if (window.ContentLoader) {
        ContentLoader.getBySlug('projects', slug).then(renderProject).catch(function (e) {
          console.error(e);
          setHtml('project-info-body', '<p>Failed to load project data.</p>');
        });
      } else {
        fetch('/data/projects.json')
          .then(function (r) {
            return r.json();
          })
          .then(function (data) {
            var project = Array.isArray(data)
              ? data.find(function (p) {
                  return p.slug === slug;
                })
              : data[slug];
            renderProject(project);
          });
      }
    }

    // Wait for w3-include of project-page.html if present
    var tries = 0;
    function waitForDom() {
      if (document.getElementById('project-title') || tries > 40) {
        run();
        return;
      }
      tries += 1;
      setTimeout(waitForDom, 50);
    }
    waitForDom();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
