(function () {
  function boot() {
    var slug = window.BLOG_SLUG;
    if (!slug) return;

    function render(post) {
      if (!post) {
        document.getElementById('blog-body').textContent = 'Post not found.';
        return;
      }
      var titleEl = document.getElementById('blog-title');
      var dateEl = document.getElementById('blog-date');
      var bodyEl = document.getElementById('blog-body');
      if (titleEl) titleEl.textContent = post.title || '';
      if (dateEl) dateEl.textContent = post.date || '';
      if (bodyEl) {
        bodyEl.innerHTML = window.ContentLoader
          ? ContentLoader.renderMarkdown(post.body || '')
          : post.body || '';
      }
      if (post.title) document.title = post.title + ' — JDWhittall';
    }

    if (window.ContentLoader) {
      ContentLoader.load('blog').then(function (data) {
        var list = Array.isArray(data) ? data : Object.keys(data || {}).map(function (k) { return data[k]; });
        render(list.find(function (p) { return p.slug === slug; }));
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
