/* ==========================================================================
   OP4 basics • Obecné principy počítačových sítí (app.js)
   Samostatná bezbuildová SPA aplikace (ES5 IIFE, hash routing, offline média)
   ========================================================================== */
(function (global) {
  'use strict';

  var STORAGE_THEME_KEY = 'op4_theme';
  var STORAGE_PROGRESS_KEY = 'op4_progress';
  var STORAGE_PREFS_KEY = 'op4_prefs';

  /* ------------------------------------------------------------------------
     Pomocné funkce, sanitizace & Carbon Icons
     ------------------------------------------------------------------------ */
  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function safeColor(hex) {
    return /^#[0-9a-fA-F]{3,8}$/.test(String(hex || '')) ? hex : '#38bdf8';
  }

  function safeMediaPath(p) {
    return typeof p === 'string' && /^media\/[a-zA-Z0-9_\/.-]+$/.test(p) && p.indexOf('..') === -1 ? p : '';
  }

  function isPlainObject(val) {
    return val !== null && typeof val === 'object' && !Array.isArray(val);
  }

  function icon(name, size, extraClass) {
    if (global.CarbonIcons && typeof global.CarbonIcons.render === 'function') {
      return global.CarbonIcons.render(name, {
        size: size || 16,
        className: extraClass || ''
      });
    }
    return '';
  }

  function readStorage(key, fallback) {
    try {
      var raw = global.localStorage.getItem(key);
      if (!raw) return fallback;
      var parsed = JSON.parse(raw);
      return parsed === undefined ? fallback : parsed;
    } catch (e) {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      global.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* Tiché selhání v přísném privátním režimu */
    }
  }

  function formatTimeMMSS(sec) {
    var s = Math.max(0, Math.floor(Number(sec) || 0));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return m + ':' + (r < 10 ? '0' : '') + r;
  }

  function pad2(n) {
    var num = Number(n) || 0;
    return (num < 10 ? '0' : '') + num;
  }

  function showToast(message) {
    var region = document.getElementById('toast-region');
    if (!region) return;
    var el = document.createElement('div');
    el.className = 'toast';
    el.textContent = String(message || '');
    region.appendChild(el);
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 2400);
  }

  function copyText(text, successMsg) {
    var txt = String(text || '');
    function fallbackCopy() {
      var ta = document.createElement('textarea');
      ta.value = txt;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        showToast(successMsg || 'Zkopírováno do schránky.');
      } catch (e) {
        showToast('Kopírování se nezdařilo – označ text ručně.');
      }
      document.body.removeChild(ta);
    }

    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(txt).then(function () {
        showToast(successMsg || 'Zkopírováno do schránky.');
      }, fallbackCopy);
    } else {
      fallbackCopy();
    }
  }

  function shuffleArray(arr) {
    var copy = arr.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function getDifficultyBadgeClass(diff) {
    if (diff === 'Základy' || diff === 'Základní') return 'badge-emerald';
    if (diff === 'Střední') return 'badge-amber';
    if (diff === 'Pokročilé') return 'badge-rose';
    return 'badge-neutral';
  }

  /* ------------------------------------------------------------------------
     Kurikulum & perzistentní stav (op4_progress, op4_prefs)
     ------------------------------------------------------------------------ */
  var curriculum = global.NETWORK_CURRICULUM || null;
  var topics = curriculum && Array.isArray(curriculum.topics)
    ? curriculum.topics.slice().sort(function (a, b) { return (a.number || 0) - (b.number || 0); })
    : [];
  var modules = curriculum && Array.isArray(curriculum.modules)
    ? curriculum.modules.slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); })
    : [];
  var glossary = curriculum && Array.isArray(curriculum.glossary) ? curriculum.glossary : [];

  function findTopic(id) {
    for (var i = 0; i < topics.length; i++) {
      if (topics[i].id === id) return topics[i];
    }
    return null;
  }

  function getModuleInfo(moduleId) {
    for (var i = 0; i < modules.length; i++) {
      var m = modules[i];
      if ((m.id || m.moduleId) === moduleId) {
        return {
          id: m.id || m.moduleId,
          title: m.title || m.name || moduleId,
          shortTitle: m.shortTitle || m.title || moduleId,
          subtitle: m.subtitle || m.description || '',
          icon: m.icon || 'connect',
          color: safeColor(m.accentColor || m.color)
        };
      }
    }
    return {
      id: moduleId,
      title: moduleId,
      shortTitle: moduleId,
      subtitle: '',
      icon: 'connect',
      color: '#38bdf8'
    };
  }

  var rawProgress = readStorage(STORAGE_PROGRESS_KEY, null);
  var progress = {
    quizAnswers: {},
    manualCompleted: {},
    lastTopicId: null
  };

  if (isPlainObject(rawProgress)) {
    if (isPlainObject(rawProgress.quizAnswers)) {
      Object.keys(rawProgress.quizAnswers).forEach(function (tId) {
        var topicObj = findTopic(tId);
        var ansMap = rawProgress.quizAnswers[tId];
        if (topicObj && Array.isArray(topicObj.quiz) && isPlainObject(ansMap)) {
          var cleanMap = {};
          Object.keys(ansMap).forEach(function (qKey) {
            var qIdx = Number(qKey);
            var val = ansMap[qKey];
            if (
              /^\d+$/.test(qKey) &&
              qIdx >= 0 &&
              qIdx < topicObj.quiz.length &&
              typeof val === 'number' &&
              Number.isInteger(val) &&
              val >= 0 &&
              Array.isArray(topicObj.quiz[qIdx].options) &&
              val < topicObj.quiz[qIdx].options.length
            ) {
              cleanMap[qIdx] = val;
            }
          });
          progress.quizAnswers[tId] = cleanMap;
        }
      });
    }
    if (isPlainObject(rawProgress.manualCompleted)) {
      Object.keys(rawProgress.manualCompleted).forEach(function (tId) {
        if (findTopic(tId) && typeof rawProgress.manualCompleted[tId] === 'boolean') {
          progress.manualCompleted[tId] = rawProgress.manualCompleted[tId];
        }
      });
    }
    if (typeof rawProgress.lastTopicId === 'string' && findTopic(rawProgress.lastTopicId)) {
      progress.lastTopicId = rawProgress.lastTopicId;
    }
  }

  var rawPrefs = readStorage(STORAGE_PREFS_KEY, null);
  var prefs = {
    presentationMode: isPlainObject(rawPrefs) && rawPrefs.presentationMode === true
  };

  var state = {
    view: 'dashboard',
    activeTopicId: progress.lastTopicId || (topics[0] ? topics[0].id : null),
    topicTab: 'showcase',
    sceneMode: null,
    presentationMode: prefs.presentationMode,
    drawerOpen: false,
    drawerSearch: '',
    dashSearch: '',
    dashFilter: 'all',
    dashMandatoryOnly: false,
    glossarySearch: '',
    glossaryCategory: 'all',
    subnetIp: '192.168.10.42',
    subnetPrefix: 26,
    trainerChallenge: null,
    trainerInputs: { net: '', bcast: '', first: '', hosts: '' },
    trainerChecked: false,
    examScope: 'random10',
    examQuestions: [],
    examAnswers: {},
    examSubmitted: false
  };

  var activeStageRenderer = null;
  var activeCardPreviewRafs = {};
  var isSyncingHash = false;
  var lastFocusedModalEl = null;

  /* ------------------------------------------------------------------------
     Pokrok & statistiky
     ------------------------------------------------------------------------ */
  function hasBundledVideo(topic) {
    return Boolean(topic && topic.video && topic.video.hasBundledVideo === true && safeMediaPath(topic.video.src));
  }

  function getTopicQuizStats(topic) {
    var qList = Array.isArray(topic.quiz) ? topic.quiz : [];
    var saved = progress.quizAnswers[topic.id] || {};
    var answered = 0;
    var correct = 0;
    for (var i = 0; i < qList.length; i++) {
      var val = saved[i];
      if (typeof val === 'number' && Number.isInteger(val) && val >= 0 && Array.isArray(qList[i].options) && val < qList[i].options.length) {
        answered++;
        if (val === qList[i].correctIndex) correct++;
      }
    }
    return { total: qList.length, answered: answered, correct: correct };
  }

  function isTopicCompleted(topic) {
    if (!topic) return false;
    if (progress.manualCompleted[topic.id] === true) return true;
    if (progress.manualCompleted[topic.id] === false) return false;
    var qs = getTopicQuizStats(topic);
    return qs.total > 0 && qs.answered === qs.total && qs.correct >= Math.ceil(qs.total * 0.66);
  }

  function getOverallStats() {
    var completedCount = 0;
    var mandatoryCompleted = 0;
    var mandatoryTotal = 0;
    var correctQuestions = 0;
    var totalQuestions = 0;
    for (var i = 0; i < topics.length; i++) {
      var t = topics[i];
      var done = isTopicCompleted(t);
      if (done) completedCount++;
      if (t.mandatory) {
        mandatoryTotal++;
        if (done) mandatoryCompleted++;
      }
      var qs = getTopicQuizStats(t);
      correctQuestions += qs.correct;
      totalQuestions += qs.total;
    }
    return {
      completedTopics: completedCount,
      totalTopics: topics.length,
      mandatoryCompleted: mandatoryCompleted,
      mandatoryTotal: mandatoryTotal,
      correctQuestions: correctQuestions,
      totalQuestions: totalQuestions
    };
  }

  function updateGlobalProgressIndicators() {
    var stats = getOverallStats();
    var drawerEl = document.getElementById('drawer-progress-text');
    if (drawerEl) {
      drawerEl.textContent = stats.completedTopics + ' z ' + stats.totalTopics + ' kapitol splněno';
    }
    var topbarEl = document.getElementById('topbar-progress');
    if (topbarEl) {
      topbarEl.textContent = stats.completedTopics + ' / ' + stats.totalTopics;
    }
  }

  function saveProgress() {
    writeStorage(STORAGE_PROGRESS_KEY, progress);
    updateGlobalProgressIndicators();
    renderDrawerTree();
  }

  /* ------------------------------------------------------------------------
     Barevný režim & Prezentační režim
     ------------------------------------------------------------------------ */
  function applyTheme(theme) {
    var isDark = theme === 'dark';
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    try {
      global.localStorage.setItem(STORAGE_THEME_KEY, isDark ? 'dark' : 'light');
    } catch (e) { /* ignore */ }

    var btn = document.getElementById('theme-toggle');
    var iconEl = document.getElementById('theme-icon');
    if (btn) btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    if (iconEl) iconEl.innerHTML = icon(isDark ? 'light' : 'moon', 18);
  }

  function initTheme() {
    var saved = 'light';
    try {
      saved = global.localStorage.getItem(STORAGE_THEME_KEY) || 'light';
    } catch (e) { /* ignore */ }
    applyTheme(saved === 'dark' ? 'dark' : 'light');
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        var cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        applyTheme(cur === 'dark' ? 'light' : 'dark');
      });
    }
  }

  function syncPresentationButtons(isOn) {
    var topBtn = document.getElementById('presentation-toggle');
    var topIcon = document.getElementById('presentation-icon');
    if (topBtn) {
      topBtn.setAttribute('aria-pressed', isOn ? 'true' : 'false');
      topBtn.classList.toggle('is-active', isOn);
    }
    if (topIcon) {
      topIcon.innerHTML = icon(isOn ? 'minimize' : 'presentation', 16);
    }

    var topicBtn = document.getElementById('topic-presentation-btn');
    if (topicBtn) {
      topicBtn.setAttribute('aria-pressed', isOn ? 'true' : 'false');
      topicBtn.classList.toggle('is-active', isOn);
      topicBtn.innerHTML = icon(isOn ? 'minimize' : 'presentation', 16) +
        '<span>' + (isOn ? 'Ukončit prezentaci' : 'Prezentace') + '</span>';
    }
  }

  function applyPresentation(isOn) {
    var enabled = Boolean(isOn);
    state.presentationMode = enabled;
    prefs.presentationMode = enabled;
    if (enabled) {
      document.documentElement.setAttribute('data-presentation', 'true');
    } else {
      document.documentElement.removeAttribute('data-presentation');
    }
    writeStorage(STORAGE_PREFS_KEY, prefs);
    syncPresentationButtons(enabled);
  }

  function initPresentation() {
    applyPresentation(prefs.presentationMode);
    var topBtn = document.getElementById('presentation-toggle');
    if (topBtn) {
      topBtn.addEventListener('click', function () {
        applyPresentation(!state.presentationMode);
      });
    }
  }

  /* ------------------------------------------------------------------------
     Vysouvací šuplík kapitol (#topic-drawer)
     ------------------------------------------------------------------------ */
  function setDrawerOpen(isOpen) {
    state.drawerOpen = Boolean(isOpen);
    var drawer = document.getElementById('topic-drawer');
    var overlay = document.getElementById('drawer-overlay');
    var toggle = document.getElementById('drawer-toggle');
    if (drawer) drawer.hidden = !state.drawerOpen;
    if (overlay) overlay.hidden = !state.drawerOpen;
    if (toggle) toggle.setAttribute('aria-expanded', state.drawerOpen ? 'true' : 'false');
    if (state.drawerOpen) {
      renderDrawerTree();
      var searchInp = document.getElementById('drawer-search-input');
      if (searchInp) searchInp.focus();
    }
  }

  function topicMatchesSearch(topic, query) {
    if (!query) return true;
    var q = query.trim().toLowerCase();
    if (!q) return true;
    var mod = getModuleInfo(topic.moduleId);
    var hay = [
      pad2(topic.number),
      topic.title,
      topic.shortTitle,
      topic.subtitle,
      topic.cardSummary,
      mod.title,
      mod.shortTitle,
      (topic.tags || []).join(' '),
      (topic.takeaways || []).join(' ')
    ].join(' ').toLowerCase();
    return hay.indexOf(q) !== -1;
  }

  function renderDrawerTree() {
    var treeEl = document.getElementById('drawer-tree');
    var clearBtn = document.getElementById('drawer-search-clear');
    if (clearBtn) clearBtn.hidden = !state.drawerSearch;
    if (!treeEl) return;

    var q = state.drawerSearch.trim();
    var html = '';
    var totalMatched = 0;

    modules.forEach(function (m) {
      var mId = m.id || m.moduleId;
      var modTopics = topics.filter(function (t) {
        return t.moduleId === mId && topicMatchesSearch(t, q);
      });
      if (modTopics.length === 0) return;

      totalMatched += modTopics.length;
      html +=
        '<div class="drawer-group">' +
          '<div class="drawer-group-label">' + esc(m.title || m.shortTitle) + '</div>' +
          modTopics.map(function (t) {
            var isActive = state.view === 'topic' && state.activeTopicId === t.id;
            var done = isTopicCompleted(t);
            var hasVid = hasBundledVideo(t);
            return '<button type="button" class="drawer-topic-btn ' + (isActive ? 'is-active' : '') + '" data-drawer-topic="' + esc(t.id) + '"' + (isActive ? ' aria-current="page"' : '') + '>' +
              '<span class="drawer-topic-num">' + pad2(t.number) + '</span>' +
              '<span class="drawer-topic-title">' +
                '<span>' + esc(t.title) + '</span>' +
                (t.mandatory ? '<span class="drawer-mandatory-dot" title="Povinný okruh"></span>' : '') +
              '</span>' +
              '<span class="drawer-topic-status" style="color:' + (done ? 'var(--ok)' : 'var(--text-muted)') + ';">' +
                (done ? icon('checkmark--outline', 14) : icon(hasVid ? 'video' : 'play--outline', 14)) +
              '</span>' +
            '</button>';
          }).join('') +
        '</div>';
    });

    if (totalMatched === 0) {
      treeEl.innerHTML =
        '<div class="drawer-empty" role="status">' +
          '<div>Žádné téma neodpovídá výrazu „' + esc(q) + '“.</div>' +
          '<button type="button" class="btn btn-sm" id="drawer-empty-reset">Vymazat hledání</button>' +
        '</div>';
      var resetBtn = document.getElementById('drawer-empty-reset');
      if (resetBtn) {
        resetBtn.addEventListener('click', function () {
          state.drawerSearch = '';
          var inp = document.getElementById('drawer-search-input');
          if (inp) {
            inp.value = '';
            inp.focus();
          }
          renderDrawerTree();
        });
      }
      return;
    }

    treeEl.innerHTML = html;
    treeEl.querySelectorAll('[data-drawer-topic]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        navigateTo('topic', { topicId: btn.getAttribute('data-drawer-topic'), resetScene: true });
      });
    });
  }

  /* ------------------------------------------------------------------------
     Modal (Slovníček & Klíčové pojmy)
     ------------------------------------------------------------------------ */
  function openModal(opts) {
    var backdrop = document.getElementById('app-modal');
    var badge = document.getElementById('modal-badge');
    var title = document.getElementById('modal-title');
    var body = document.getElementById('modal-body');
    var footer = document.getElementById('modal-footer');
    if (!backdrop) return;

    lastFocusedModalEl = document.activeElement;

    badge.textContent = opts.badge || 'Pojem ze slovníčku';
    title.textContent = opts.title || '';
    body.innerHTML = opts.bodyHtml || '';
    footer.innerHTML = '';

    if (Array.isArray(opts.actions)) {
      opts.actions.forEach(function (act) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-sm ' + (act.className || '');
        btn.textContent = act.label;
        btn.addEventListener('click', function () {
          closeModal(true);
          if (act.onClick) act.onClick();
        });
        footer.appendChild(btn);
      });
    }

    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'btn btn-sm';
    closeBtn.textContent = 'Zavřít';
    closeBtn.addEventListener('click', function () { closeModal(false); });
    footer.appendChild(closeBtn);

    backdrop.hidden = false;
    var xBtn = document.getElementById('modal-close');
    if (xBtn) xBtn.focus();
  }

  function closeModal(skipFocusRestore) {
    var backdrop = document.getElementById('app-modal');
    if (backdrop) backdrop.hidden = true;
    if (!skipFocusRestore && lastFocusedModalEl && typeof lastFocusedModalEl.focus === 'function') {
      try { lastFocusedModalEl.focus(); } catch (e) { /* ignore */ }
    }
    lastFocusedModalEl = null;
  }

  function findGlossaryMatch(tagText) {
    var q = String(tagText || '').trim().toLowerCase();
    if (!q) return null;
    for (var i = 0; i < glossary.length; i++) {
      if (glossary[i].term.toLowerCase() === q) return glossary[i];
    }
    for (var j = 0; j < glossary.length; j++) {
      var termLow = glossary[j].term.toLowerCase();
      if (termLow.indexOf(q) !== -1 || q.indexOf(termLow) !== -1) {
        return glossary[j];
      }
    }
    var tokens = q.split(/[\s/(),–-]+/).filter(function (tk) { return tk.length >= 2; });
    for (var tIdx = 0; tIdx < tokens.length; tIdx++) {
      var tk = tokens[tIdx];
      for (var gIdx = 0; gIdx < glossary.length; gIdx++) {
        var gTerm = glossary[gIdx].term.toLowerCase();
        if (gTerm === tk || gTerm.indexOf(tk) !== -1) return glossary[gIdx];
      }
    }
    for (var k = 0; k < glossary.length; k++) {
      if ((glossary[k].shortDef + ' ' + glossary[k].detail).toLowerCase().indexOf(q) !== -1) {
        return glossary[k];
      }
    }
    return null;
  }

  function findTopicContextForTag(tagText, topic) {
    if (!topic) return '';
    var tokens = String(tagText || '').toLowerCase().split(/[\s/(),–-]+/).filter(function (tk) { return tk.length >= 2; });
    var lines = [].concat(topic.takeaways || [], (topic.principle && topic.principle.explanation) || []);
    for (var i = 0; i < lines.length; i++) {
      var low = String(lines[i]).toLowerCase();
      for (var j = 0; j < tokens.length; j++) {
        if (low.indexOf(tokens[j]) !== -1) return lines[i];
      }
    }
    return '';
  }

  function openGlossaryModal(item) {
    if (!item) return;
    var relTopic = findTopic(item.relatedTopicId);
    var actions = [];
    if (relTopic) {
      actions.push({
        label: 'Přejít na kapitolu ' + pad2(relTopic.number) + ': ' + (relTopic.shortTitle || relTopic.title),
        className: 'btn-primary',
        onClick: function () {
          navigateTo('topic', { topicId: relTopic.id, resetScene: true });
        }
      });
    }
    openModal({
      badge: item.category || 'Slovníček',
      title: item.term,
      bodyHtml:
        '<p><strong>' + esc(item.shortDef) + '</strong></p>' +
        '<p style="margin-bottom:0;">' + esc(item.detail) + '</p>',
      actions: actions
    });
  }

  function handleTagClick(tagText, currentTopic) {
    var match = findGlossaryMatch(tagText);
    if (match) {
      var actions = [
        {
          label: 'Otevřít ve slovníčku',
          className: 'btn-primary',
          onClick: function () {
            state.glossarySearch = match.term;
            state.glossaryCategory = 'all';
            navigateTo('glossary');
          }
        }
      ];
      var relTopic = findTopic(match.relatedTopicId);
      if (relTopic && (!currentTopic || relTopic.id !== currentTopic.id)) {
        actions.push({
          label: 'Kapitola ' + pad2(relTopic.number),
          onClick: function () {
            navigateTo('topic', { topicId: relTopic.id, resetScene: true });
          }
        });
      }
      openModal({
        badge: match.category || 'Slovníček',
        title: match.term,
        bodyHtml:
          '<p><strong>' + esc(match.shortDef) + '</strong></p>' +
          '<p style="margin-bottom:0;">' + esc(match.detail) + '</p>',
        actions: actions
      });
    } else {
      var ctxSnippet = findTopicContextForTag(tagText, currentTopic);
      openModal({
        badge: 'Klíčový pojem · Kapitola ' + pad2(currentTopic.number),
        title: tagText,
        bodyHtml:
          '<p style="margin-bottom:0;">' +
            (ctxSnippet
              ? esc(ctxSnippet)
              : 'Tento pojem je součástí kapitoly <strong>' + esc(currentTopic.title) + '</strong>.') +
          '</p>',
        actions: [
          {
            label: 'Hledat ve slovníčku',
            className: 'btn-primary',
            onClick: function () {
              state.glossarySearch = tagText.split(/[\s/(]+/)[0];
              state.glossaryCategory = 'all';
              navigateTo('glossary');
            }
          }
        ]
      });
    }
  }

  /* ------------------------------------------------------------------------
     Životní cyklus ukázek, náhledů & Hash Routing
     ------------------------------------------------------------------------ */
  function destroyActiveStage() {
    if (activeStageRenderer) {
      try { activeStageRenderer.destroy(); } catch (e) { /* ignore */ }
      activeStageRenderer = null;
    }
    var vid = document.getElementById('topic-video-player');
    if (vid) {
      try { vid.pause(); } catch (e) { /* ignore */ }
    }
  }

  function syncPreviewToggleBtn(card, isPinned) {
    var btn = card ? card.querySelector('[data-preview-toggle]') : null;
    if (!btn) return;
    var isVid = btn.getAttribute('data-preview-kind') === 'video';
    var title = btn.getAttribute('data-preview-title') || '';
    btn.setAttribute('aria-pressed', isPinned ? 'true' : 'false');
    btn.setAttribute(
      'aria-label',
      isPinned
        ? (isVid ? 'Zastavit náhled videa: ' : 'Zastavit náhled animace: ') + title
        : (isVid ? 'Přehrát náhled videa: ' : 'Spustit náhled animace: ') + title
    );
    btn.innerHTML = icon(isPinned ? 'pause' : 'play--filled', 14);
  }

  function destroyCardPreviews() {
    Object.keys(activeCardPreviewRafs).forEach(function (key) {
      global.cancelAnimationFrame(activeCardPreviewRafs[key]);
      delete activeCardPreviewRafs[key];
    });
    var videos = document.querySelectorAll('.card-preview-video');
    for (var i = 0; i < videos.length; i++) {
      var v = videos[i];
      v._previewActive = false;
      try { v.pause(); } catch (e) { /* ignore */ }
    }
    var cards = document.querySelectorAll('.topic-card.is-previewing');
    for (var j = 0; j < cards.length; j++) {
      cards[j]._previewActive = false;
      cards[j]._previewPinned = false;
      cards[j]._previewHover = false;
      cards[j]._previewFocus = false;
      cards[j].classList.remove('is-previewing');
      syncPreviewToggleBtn(cards[j], false);
    }
  }

  function normalizeViewName(view) {
    if (view === 'subnetting') return 'calc';
    if (view === 'exam') return 'test';
    if (view === 'topic' || view === 'calc' || view === 'glossary' || view === 'test' || view === 'dashboard') {
      return view;
    }
    return 'dashboard';
  }

  function parseHash(rawHash) {
    var h = String(rawHash || '').replace(/^#\/?/, '').trim();
    if (!h || h === 'dashboard') {
      return { view: 'dashboard', topicId: null, canonical: true };
    }
    if (h === 'calc') return { view: 'calc', topicId: null, canonical: true };
    if (h === 'subnetting') return { view: 'calc', topicId: null, canonical: false };
    if (h === 'glossary') return { view: 'glossary', topicId: null, canonical: true };
    if (h === 'test') return { view: 'test', topicId: null, canonical: true };
    if (h === 'exam') return { view: 'test', topicId: null, canonical: false };
    if (h.indexOf('topic/') === 0) {
      var rawId = h.slice(6);
      var decodedId = rawId;
      try {
        decodedId = decodeURIComponent(rawId);
      } catch (e) {
        decodedId = rawId;
      }
      if (findTopic(decodedId)) {
        return { view: 'topic', topicId: decodedId, canonical: true };
      }
      return { view: 'dashboard', topicId: null, canonical: false };
    }
    return { view: 'dashboard', topicId: null, canonical: false };
  }

  function buildHashForState() {
    if (state.view === 'topic' && state.activeTopicId) {
      return '#topic/' + encodeURIComponent(state.activeTopicId);
    }
    if (state.view === 'calc') return '#calc';
    if (state.view === 'glossary') return '#glossary';
    if (state.view === 'test') return '#test';
    return '#dashboard';
  }

  function syncHashFromState(replace) {
    var targetHash = buildHashForState();
    if (global.location.hash === targetHash) return;
    isSyncingHash = true;
    try {
      if (replace && global.history && typeof global.history.replaceState === 'function') {
        global.history.replaceState(null, '', targetHash);
      } else {
        global.location.hash = targetHash;
      }
    } catch (e) { /* ignore */ }
    setTimeout(function () {
      isSyncingHash = false;
    }, 0);
  }

  function updateNavHighlight() {
    document.querySelectorAll('[data-nav]').forEach(function (btn) {
      var target = normalizeViewName(btn.getAttribute('data-nav'));
      if (btn.classList.contains('brand-btn')) return;
      if (target === state.view) {
        btn.classList.add('is-active');
        btn.setAttribute('aria-current', 'page');
      } else {
        btn.classList.remove('is-active');
        btn.removeAttribute('aria-current');
      }
    });
  }

  function navigateTo(view, opts) {
    var options = opts || {};
    var nextView = normalizeViewName(view);
    destroyActiveStage();
    destroyCardPreviews();
    state.view = nextView;

    if (nextView === 'topic') {
      var targetId = options.topicId || state.activeTopicId || (topics[0] ? topics[0].id : null);
      var topicObj = findTopic(targetId) || topics[0];
      if (topicObj) {
        if (state.activeTopicId !== topicObj.id || options.resetScene) {
          state.activeTopicId = topicObj.id;
          state.sceneMode = null;
          state.topicTab = options.tab || 'showcase';
        } else if (options.tab) {
          state.topicTab = options.tab;
        }
        progress.lastTopicId = topicObj.id;
        saveProgress();
      }
    }

    if (state.drawerOpen) setDrawerOpen(false);
    if (!options.skipHashSync) {
      syncHashFromState(Boolean(options.replaceHash));
    }
    updateNavHighlight();
    renderCurrentView();
    if (!options.preserveScroll) {
      global.scrollTo({ top: 0, behavior: 'auto' });
    }
  }

  function handleHashChange() {
    if (isSyncingHash) return;
    var parsed = parseHash(global.location.hash);
    destroyActiveStage();
    destroyCardPreviews();
    state.view = parsed.view;
    if (parsed.view === 'topic' && parsed.topicId) {
      var changed = state.activeTopicId !== parsed.topicId;
      state.activeTopicId = parsed.topicId;
      if (changed) {
        state.sceneMode = null;
        state.topicTab = 'showcase';
      }
      progress.lastTopicId = parsed.topicId;
      saveProgress();
    }
    if (!parsed.canonical) {
      syncHashFromState(true);
    }
    if (state.drawerOpen) setDrawerOpen(false);
    updateNavHighlight();
    renderCurrentView();
    global.scrollTo({ top: 0, behavior: 'auto' });
  }

  /* ------------------------------------------------------------------------
     Pohled 1 (Výchozí): Dashboard s 16:9 video / canvas náhledy
     ------------------------------------------------------------------------ */
  function startVideoPreview(card, videoEl, startTime) {
    if (!card || !videoEl) return;
    card._previewActive = true;
    videoEl._previewActive = true;
    card.classList.add('is-previewing');

    var tStart = Number(startTime) || 0;
    if (videoEl.preload !== 'auto') {
      videoEl.preload = 'auto';
    }

    function attemptPlay() {
      if (!card._previewActive) return;
      var p = videoEl.play();
      if (p && typeof p.catch === 'function') {
        p.catch(function () { /* tiché ošetření přerušení přehrávání */ });
      }
    }

    if (tStart > 0 && !videoEl._initialSeeked) {
      if (videoEl.readyState >= 1) {
        videoEl._initialSeeked = true;
        try { videoEl.currentTime = tStart; } catch (e) { /* ignore */ }
        attemptPlay();
      } else if (!videoEl._metadataHooked) {
        videoEl._metadataHooked = true;
        videoEl.addEventListener('loadedmetadata', function onMeta() {
          videoEl.removeEventListener('loadedmetadata', onMeta);
          videoEl._metadataHooked = false;
          if (!videoEl._initialSeeked) {
            videoEl._initialSeeked = true;
            try { videoEl.currentTime = tStart; } catch (e) { /* ignore */ }
          }
          if (card._previewActive) attemptPlay();
        });
        try { videoEl.load(); } catch (e) { /* ignore */ }
      }
    } else {
      attemptPlay();
    }

    if (!videoEl._endedHooked) {
      videoEl._endedHooked = true;
      videoEl.addEventListener('ended', function () {
        if (!card._previewActive) return;
        try { videoEl.currentTime = tStart > 0 ? tStart : 0; } catch (e) { /* ignore */ }
        attemptPlay();
      });
    }
  }

  function stopVideoPreview(card, videoEl) {
    if (!card || !videoEl) return;
    card._previewActive = false;
    videoEl._previewActive = false;
    card.classList.remove('is-previewing');
    try { videoEl.pause(); } catch (e) { /* ignore */ }
  }

  function startCanvasPreview(card, canvasEl, topicId, animType) {
    if (!card || !canvasEl || !global.PixelStageRenderer) return;
    if (activeCardPreviewRafs[topicId]) return;
    card._previewActive = true;
    card.classList.add('is-previewing');

    var startTs = null;
    var lastDrawTs = 0;

    function tick(ts) {
      if (!card._previewActive) {
        delete activeCardPreviewRafs[topicId];
        return;
      }
      if (startTs === null) startTs = ts;
      if (ts - lastDrawTs >= 60) {
        lastDrawTs = ts;
        var elapsedSec = (ts - startTs) / 1000;
        var progressVal = 0.45 + elapsedSec * 0.45;
        global.PixelStageRenderer.renderPreviewFrame(canvasEl, animType, progressVal);
      }
      activeCardPreviewRafs[topicId] = global.requestAnimationFrame(tick);
    }

    activeCardPreviewRafs[topicId] = global.requestAnimationFrame(tick);
  }

  function stopCanvasPreview(card, canvasEl, topicId, animType) {
    if (!card) return;
    card._previewActive = false;
    card.classList.remove('is-previewing');
    if (activeCardPreviewRafs[topicId]) {
      global.cancelAnimationFrame(activeCardPreviewRafs[topicId]);
      delete activeCardPreviewRafs[topicId];
    }
    if (canvasEl && global.PixelStageRenderer) {
      global.PixelStageRenderer.renderPreviewFrame(canvasEl, animType, 0.45);
    }
  }

  function paintStaticCanvasPreviews(container) {
    if (!container || !global.PixelStageRenderer || typeof global.PixelStageRenderer.renderPreviewFrame !== 'function') {
      return;
    }
    var canvases = container.querySelectorAll('.card-preview-canvas');
    for (var i = 0; i < canvases.length; i++) {
      var cvs = canvases[i];
      var animType = cvs.getAttribute('data-anim-type') || 'iso-osi';
      global.PixelStageRenderer.renderPreviewFrame(cvs, animType, 0.45);
    }
  }

  function renderDashboard(root) {
    destroyCardPreviews();
    var stats = getOverallStats();
    var pct = stats.totalTopics ? Math.round((stats.completedTopics / stats.totalTopics) * 100) : 0;

    function buildTopicCardHtml(t) {
      var done = isTopicCompleted(t);
      var vid = t.video || {};
      var isVid = hasBundledVideo(t);
      var diffClass = getDifficultyBadgeClass(t.difficulty);
      var startTime = Number(vid.startTime) || 0;
      var mediaHtml = '';

      if (isVid) {
        var srcPath = safeMediaPath(vid.src);
        var posterPath = safeMediaPath(vid.poster);
        mediaHtml =
          '<video class="card-preview-video"' +
            ' src="' + esc(srcPath) + '"' +
            (posterPath ? ' poster="' + esc(posterPath) + '"' : '') +
            ' preload="none" muted playsinline disablepictureinpicture tabindex="-1" aria-hidden="true"' +
            ' data-start-time="' + startTime + '"></video>' +
          '<div class="card-preview-overlay">' +
            '<span class="media-badge">' + icon('video', 12) + '<span>' + esc(vid.durationLabel || 'Video') + '</span></span>' +
            '<button type="button" class="card-preview-toggle" data-preview-toggle="' + esc(t.id) + '" data-preview-kind="video" data-preview-title="' + esc(t.title) + '" aria-pressed="false" aria-label="Přehrát náhled videa: ' + esc(t.title) + '">' +
              icon('play--filled', 14) +
            '</button>' +
          '</div>';
      } else {
        mediaHtml =
          '<canvas class="card-preview-canvas" width="640" height="360" data-anim-type="' + esc(t.animationType || 'iso-osi') + '" aria-hidden="true"></canvas>' +
          '<div class="card-preview-overlay">' +
            '<span class="media-badge media-badge-canvas">' + icon('play--outline', 12) + '<span>Interaktivní animace</span></span>' +
            '<button type="button" class="card-preview-toggle" data-preview-toggle="' + esc(t.id) + '" data-preview-kind="canvas" data-preview-title="' + esc(t.title) + '" aria-pressed="false" aria-label="Spustit náhled animace: ' + esc(t.title) + '">' +
              icon('play--filled', 14) +
            '</button>' +
          '</div>';
      }

      return '<article class="topic-card ' + (done ? 'is-completed' : '') + '" data-topic-id="' + esc(t.id) + '" style="--topic-accent:' + safeColor(t.accentColor) + ';">' +
        '<div class="card-media">' + mediaHtml + '</div>' +
        '<div class="card-body">' +
          '<div class="card-meta-row">' +
            '<div class="card-badges">' +
              '<span class="card-num">' + pad2(t.number) + '</span>' +
              '<span class="badge ' + diffClass + '">' + esc(t.difficulty || 'Základy') + '</span>' +
              (t.mandatory ? '<span class="badge badge-cyan badge-mandatory">Klíčové</span>' : '') +
            '</div>' +
            '<button type="button" class="card-complete-btn ' + (done ? 'is-done' : '') + '" data-toggle-complete="' + esc(t.id) + '" aria-pressed="' + (done ? 'true' : 'false') + '" aria-label="' + (done ? 'Zrušit splnění kapitoly' : 'Označit kapitolu jako splněnou') + '" title="' + (done ? 'Splněno' : 'Označit jako splněno') + '">' +
              icon(done ? 'checkmark--outline' : 'checkbox', 18) +
            '</button>' +
          '</div>' +
          '<h3 class="card-title">' +
            '<button type="button" class="topic-card-open" data-open-topic="' + esc(t.id) + '">' + esc(t.title) + '</button>' +
          '</h3>' +
          '<p class="card-summary" title="' + esc(t.cardSummary || t.subtitle || '') + '">' + esc(t.cardSummary || t.subtitle || '') + '</p>' +
        '</div>' +
      '</article>';
    }

    function buildResultsHtml() {
      var q = state.dashSearch.trim();
      var isFiltered = Boolean(q || state.dashFilter !== 'all' || state.dashMandatoryOnly);

      var filtered = topics.filter(function (t) {
        if (state.dashMandatoryOnly && !t.mandatory) return false;
        if (state.dashFilter !== 'all' && t.moduleId !== state.dashFilter) return false;
        if (!topicMatchesSearch(t, q)) return false;
        return true;
      });

      if (filtered.length === 0) {
        return '<div class="state-box">' +
          '<p style="margin-bottom:var(--space-3);">Pro zadaný filtr nebylo nalezeno žádné téma.</p>' +
          '<button type="button" class="btn btn-sm btn-primary" id="clear-filters-btn">Zobrazit vše</button>' +
        '</div>';
      }

      if (!isFiltered) {
        return modules.map(function (m) {
          var mId = m.id || m.moduleId;
          var modTopics = filtered.filter(function (t) { return t.moduleId === mId; });
          if (!modTopics.length) return '';
          var mColor = safeColor(m.accentColor || m.color);
          return '<section class="module-group" data-module-id="' + esc(mId) + '">' +
            '<div class="module-header">' +
              '<div class="module-header-left">' +
                '<span class="module-dot" style="background-color:' + mColor + ';"></span>' +
                '<span class="module-icon">' + icon(m.icon || 'connect', 18) + '</span>' +
                '<h2 class="module-title">' + esc(m.title || m.shortTitle) + '</h2>' +
                '<span class="module-count">(' + modTopics.length + ')</span>' +
              '</div>' +
              '<p class="module-desc">' + esc(m.subtitle || m.description || '') + '</p>' +
            '</div>' +
            '<div class="topics-grid">' +
              modTopics.map(buildTopicCardHtml).join('') +
            '</div>' +
          '</section>';
        }).join('');
      }

      return '<div class="dash-results-meta">Zobrazeno ' + filtered.length + ' z ' + topics.length + ' kapitol</div>' +
        '<div class="topics-grid">' +
          filtered.map(buildTopicCardHtml).join('') +
        '</div>';
    }

    root.innerHTML =
      '<section id="view-dashboard" class="dash-wrap" aria-label="Přehled obecných principů sítí">' +
        '<div class="dash-header">' +
          '<div class="dash-title-group">' +
            '<h1 class="view-title">' + esc((curriculum && curriculum.appInfo && curriculum.appInfo.title) || 'OP') + '</h1>' +
            '<p class="dash-subtitle">' + esc((curriculum && curriculum.appInfo && curriculum.appInfo.subtitle) || 'Obecné principy počítačových sítí') + '</p>' +
          '</div>' +
          '<div class="dash-header-right">' +
            '<div class="dash-progress-card">' +
              '<div class="progress-bar-track" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100" aria-label="Postup studiem">' +
                '<div id="dash-progress-fill" class="progress-bar-fill" style="width:' + pct + '%;"></div>' +
              '</div>' +
              '<span id="dash-progress-text" class="mono">' + stats.completedTopics + ' / ' + stats.totalTopics + ' kapitol</span>' +
              '<button type="button" class="btn btn-sm" id="reset-all-progress" title="Resetovat pokrok">' + icon('restart', 14) + '<span>Reset</span></button>' +
            '</div>' +
            '<div class="dash-actions">' +
              '<button type="button" class="btn btn-sm btn-primary" id="dash-test-btn">' + icon('exam-mode', 14) + '<span>Znalostní test</span></button>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="filter-toolbar">' +
          '<div class="toolbar-row">' +
            '<div class="search-wrap">' +
              '<span class="search-wrap-icon" aria-hidden="true">' + icon('search', 16) + '</span>' +
              '<input type="search" id="dash-search" class="input" placeholder="Hledat téma, protokol, zkratku nebo pojem…" value="' + esc(state.dashSearch) + '" aria-label="Hledat téma" />' +
              '<button type="button" id="dash-search-clear" class="search-wrap-clear" aria-label="Vymazat hledání"' + (state.dashSearch ? '' : ' hidden') + '>' + icon('close', 16) + '</button>' +
            '</div>' +
            '<div class="segmented" role="group" aria-label="Filtr povinných okruhů">' +
              '<button type="button" class="segmented-btn ' + (!state.dashMandatoryOnly ? 'is-active' : '') + '" data-mandatory="all" aria-pressed="' + (!state.dashMandatoryOnly ? 'true' : 'false') + '">Vše</button>' +
              '<button type="button" class="segmented-btn ' + (state.dashMandatoryOnly ? 'is-active' : '') + '" data-mandatory="only" aria-pressed="' + (state.dashMandatoryOnly ? 'true' : 'false') + '">Pouze povinné okruhy</button>' +
            '</div>' +
          '</div>' +
          '<div class="chip-row" role="group" aria-label="Filtr podle modulu">' +
            '<button type="button" class="filter-chip ' + (state.dashFilter === 'all' ? 'is-active' : '') + '" data-filter="all">Vše (' + topics.length + ')</button>' +
            modules.map(function (m) {
              var mId = m.id || m.moduleId;
              return '<button type="button" class="filter-chip ' + (state.dashFilter === mId ? 'is-active' : '') + '" data-filter="' + esc(mId) + '">' + esc(m.shortTitle || m.title) + '</button>';
            }).join('') +
          '</div>' +
        '</div>' +

        '<div id="dash-results">' + buildResultsHtml() + '</div>' +
      '</section>';

    function syncDashProgressUi() {
      var curStats = getOverallStats();
      var curPct = curStats.totalTopics ? Math.round((curStats.completedTopics / curStats.totalTopics) * 100) : 0;
      var fillEl = document.getElementById('dash-progress-fill');
      var txtEl = document.getElementById('dash-progress-text');
      if (fillEl) fillEl.style.width = curPct + '%';
      if (txtEl) txtEl.textContent = curStats.completedTopics + ' / ' + curStats.totalTopics + ' kapitol';
      var barEl = fillEl && fillEl.parentNode;
      if (barEl) barEl.setAttribute('aria-valuenow', String(curPct));
    }

    function bindResultsInteractions() {
      var resEl = document.getElementById('dash-results');
      if (!resEl) return;

      paintStaticCanvasPreviews(resEl);

      var clrBtn = document.getElementById('clear-filters-btn');
      if (clrBtn) {
        clrBtn.addEventListener('click', function () {
          state.dashSearch = '';
          state.dashFilter = 'all';
          state.dashMandatoryOnly = false;
          renderCurrentView();
        });
      }

      var cards = resEl.querySelectorAll('.topic-card');
      for (var i = 0; i < cards.length; i++) {
        (function (card) {
          var tId = card.getAttribute('data-topic-id');
          var topic = findTopic(tId);
          if (!topic) return;

          var videoEl = card.querySelector('.card-preview-video');
          var canvasEl = card.querySelector('.card-preview-canvas');
          var startTime = videoEl ? (Number(videoEl.getAttribute('data-start-time')) || 0) : 0;
          var animType = canvasEl ? (canvasEl.getAttribute('data-anim-type') || 'iso-osi') : (topic.animationType || 'iso-osi');

          function startPreview() {
            if (videoEl) startVideoPreview(card, videoEl, startTime);
            else if (canvasEl) startCanvasPreview(card, canvasEl, tId, animType);
          }

          function stopPreview() {
            card._previewPinned = false;
            syncPreviewToggleBtn(card, false);
            if (videoEl) stopVideoPreview(card, videoEl);
            else if (canvasEl) stopCanvasPreview(card, canvasEl, tId, animType);
          }

          card._previewPinned = false;
          card._previewHover = false;
          card._previewFocus = false;

          card.addEventListener('mouseenter', function () {
            card._previewHover = true;
            if (!card._previewPinned) startPreview();
          });
          card.addEventListener('mouseleave', function () {
            card._previewHover = false;
            if (!card._previewPinned) stopPreview();
          });
          card.addEventListener('focusin', function (e) {
            if (e.target && e.target.closest && (e.target.closest('[data-toggle-complete]') || e.target.closest('[data-preview-toggle]'))) {
              return;
            }
            card._previewFocus = true;
            if (!card._previewPinned) startPreview();
          });
          card.addEventListener('focusout', function (e) {
            if (!e.relatedTarget || !card.contains(e.relatedTarget)) {
              card._previewFocus = false;
              if (!card._previewPinned && !card._previewHover) {
                stopPreview();
              }
            }
          });

          card.addEventListener('click', function (e) {
            if (e.target && e.target.closest && (e.target.closest('[data-toggle-complete]') || e.target.closest('[data-preview-toggle]'))) {
              return;
            }
            navigateTo('topic', { topicId: tId, resetScene: true });
          });

          var previewToggle = card.querySelector('[data-preview-toggle]');
          if (previewToggle) {
            previewToggle.addEventListener('click', function (e) {
              e.stopPropagation();
              if (card._previewPinned) {
                card._previewPinned = false;
                card._previewHover = false;
                card._previewFocus = false;
                stopPreview();
              } else {
                card._previewPinned = true;
                startPreview();
                syncPreviewToggleBtn(card, true);
              }
            });
          }

          var completeBtn = card.querySelector('[data-toggle-complete]');
          if (completeBtn) {
            completeBtn.addEventListener('click', function (e) {
              e.stopPropagation();
              var curDone = isTopicCompleted(topic);
              var nextDone = !curDone;
              progress.manualCompleted[topic.id] = nextDone;
              saveProgress();
              card.classList.toggle('is-completed', nextDone);
              completeBtn.classList.toggle('is-done', nextDone);
              completeBtn.setAttribute('aria-pressed', nextDone ? 'true' : 'false');
              completeBtn.setAttribute('aria-label', nextDone ? 'Zrušit splnění kapitoly' : 'Označit kapitolu jako splněnou');
              completeBtn.innerHTML = icon(nextDone ? 'checkmark--outline' : 'checkbox', 18);
              syncDashProgressUi();
              showToast(nextDone ? 'Kapitola označena jako splněná.' : 'Označení zrušeno.');
            });
          }
        })(cards[i]);
      }
    }

    function updateDashResults() {
      destroyCardPreviews();
      var clrBtn = document.getElementById('dash-search-clear');
      if (clrBtn) clrBtn.hidden = !state.dashSearch;
      var resEl = document.getElementById('dash-results');
      if (resEl) {
        resEl.innerHTML = buildResultsHtml();
        bindResultsInteractions();
      }
    }

    bindResultsInteractions();

    var searchEl = document.getElementById('dash-search');
    if (searchEl) {
      searchEl.addEventListener('input', function (e) {
        state.dashSearch = e.target.value;
        updateDashResults();
      });
    }
    var clearSearchBtn = document.getElementById('dash-search-clear');
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', function () {
        state.dashSearch = '';
        if (searchEl) {
          searchEl.value = '';
          searchEl.focus();
        }
        updateDashResults();
      });
    }

    root.querySelectorAll('[data-mandatory]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var mode = btn.getAttribute('data-mandatory');
        state.dashMandatoryOnly = (mode === 'only');
        root.querySelectorAll('[data-mandatory]').forEach(function (b) {
          var active = (b.getAttribute('data-mandatory') === 'only') === state.dashMandatoryOnly;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        updateDashResults();
      });
    });

    root.querySelectorAll('[data-filter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.dashFilter = btn.getAttribute('data-filter');
        root.querySelectorAll('[data-filter]').forEach(function (b) {
          b.classList.toggle('is-active', b.getAttribute('data-filter') === state.dashFilter);
        });
        updateDashResults();
      });
    });

    var dashTestBtn = document.getElementById('dash-test-btn');
    if (dashTestBtn) {
      dashTestBtn.addEventListener('click', function () {
        navigateTo('test');
      });
    }

    var resetAllBtn = document.getElementById('reset-all-progress');
    if (resetAllBtn) {
      resetAllBtn.addEventListener('click', function () {
        if (global.confirm('Opravdu chceš resetovat veškerý studijní pokrok?')) {
          progress.quizAnswers = {};
          progress.manualCompleted = {};
          saveProgress();
          renderCurrentView();
          showToast('Pokrok resetován.');
        }
      });
    }
  }

  /* ------------------------------------------------------------------------
     Pohled 2: Detail kapitoly (4-záložkové pracoviště)
     ------------------------------------------------------------------------ */
  function renderTopicDetail(root) {
    var topic = findTopic(state.activeTopicId) || topics[0];
    if (!topic) {
      root.innerHTML = '<div class="state-box"><h1>Žádná kapitola není k dispozici</h1></div>';
      return;
    }

    var idx = topics.indexOf(topic);
    var prevTopic = idx > 0 ? topics[idx - 1] : null;
    var nextTopic = idx < topics.length - 1 ? topics[idx + 1] : null;
    var mod = getModuleInfo(topic.moduleId);
    var done = isTopicCompleted(topic);
    var hasVideo = hasBundledVideo(topic);
    var qs = getTopicQuizStats(topic);
    var diffClass = getDifficultyBadgeClass(topic.difficulty);

    if (!state.sceneMode || (state.sceneMode === 'video' && !hasVideo)) {
      state.sceneMode = hasVideo ? 'video' : 'animation';
    }

    root.innerHTML =
      '<section id="view-topic" class="topic-wrap" aria-label="Detail kapitoly">' +
        '<header class="topic-head">' +
          '<div class="topic-head-top">' +
            '<div class="topic-head-left">' +
              '<button type="button" class="btn btn-sm" id="back-to-dashboard-btn">' +
                icon('arrow--left', 16) + '<span>Přehled</span>' +
              '</button>' +
              '<button type="button" class="btn btn-sm" id="header-prev-topic-btn" aria-label="Předchozí kapitola"' + (!prevTopic ? ' disabled' : '') + '>' +
                icon('chevron--left', 16) +
              '</button>' +
              '<button type="button" class="btn btn-sm" id="header-next-topic-btn" aria-label="Následující kapitola"' + (!nextTopic ? ' disabled' : '') + '>' +
                icon('chevron--right', 16) +
              '</button>' +
            '</div>' +
            '<div class="topic-head-right">' +
              '<button type="button" class="btn btn-sm ' + (state.presentationMode ? 'is-active' : '') + '" id="topic-presentation-btn" aria-pressed="' + (state.presentationMode ? 'true' : 'false') + '">' +
                icon(state.presentationMode ? 'minimize' : 'presentation', 16) +
                '<span>' + (state.presentationMode ? 'Ukončit prezentaci' : 'Prezentace') + '</span>' +
              '</button>' +
              '<button type="button" id="toggle-complete-btn" class="btn btn-sm ' + (done ? 'btn-ok' : '') + '" aria-pressed="' + (done ? 'true' : 'false') + '">' +
                icon(done ? 'checkbox--checked' : 'checkbox', 16) +
                '<span>' + (done ? 'Splněno' : 'Označit splněno') + '</span>' +
              '</button>' +
            '</div>' +
          '</div>' +
          '<div class="topic-meta-badges">' +
            '<span class="topic-crumb">' + pad2(topic.number) + ' / ' + topics.length + ' · ' + esc(mod.shortTitle) + '</span>' +
            '<span class="badge ' + diffClass + '">' + esc(topic.difficulty || 'Základy') + '</span>' +
            (topic.mandatory ? '<span class="badge badge-cyan">Povinné téma</span>' : '') +
          '</div>' +
          '<h1 class="topic-title">' + esc(topic.title) + '</h1>' +
          '<p class="topic-subtitle">' + esc(topic.subtitle) + '</p>' +
        '</header>' +

        '<div class="topic-tabs" role="tablist" aria-label="Sekce kapitoly">' +
          '<button type="button" role="tab" class="topic-tab-btn" id="tab-showcase" aria-selected="' + (state.topicTab === 'showcase' ? 'true' : 'false') + '" data-ttab="showcase">' +
            icon('play--outline', 16) + '<span>Ukázka</span>' +
          '</button>' +
          '<button type="button" role="tab" class="topic-tab-btn" id="tab-principle" aria-selected="' + (state.topicTab === 'principle' ? 'true' : 'false') + '" data-ttab="principle">' +
            icon('document--view', 16) + '<span>Princip</span>' +
          '</button>' +
          '<button type="button" role="tab" class="topic-tab-btn" id="tab-practice" aria-selected="' + (state.topicTab === 'practice' ? 'true' : 'false') + '" data-ttab="practice">' +
            icon('chemistry', 16) + '<span>Lab &amp; Praxe</span>' +
          '</button>' +
          '<button type="button" role="tab" class="topic-tab-btn" id="tab-quiz" aria-selected="' + (state.topicTab === 'quiz' ? 'true' : 'false') + '" data-ttab="quiz">' +
            icon('list--checked', 16) + '<span id="tab-quiz-label">Kvíz (' + qs.correct + '/' + qs.total + ')</span>' +
          '</button>' +
        '</div>' +

        '<div id="topic-tab-panel" class="topic-panel" role="tabpanel" aria-labelledby="tab-' + esc(state.topicTab) + '"></div>' +

        '<nav class="topic-footer-nav" aria-label="Přechod mezi kapitolami">' +
          '<button type="button" class="btn btn-sm" id="prev-topic-btn"' + (!prevTopic ? ' disabled' : '') + '>' +
            icon('arrow--left', 16) +
            '<span>' + (prevTopic ? pad2(prevTopic.number) + ' ' + esc(prevTopic.shortTitle || prevTopic.title) : 'Začátek přehledu') + '</span>' +
          '</button>' +
          '<button type="button" class="btn btn-sm" id="next-topic-btn"' + (!nextTopic ? ' disabled' : '') + '>' +
            '<span>' + (nextTopic ? pad2(nextTopic.number) + ' ' + esc(nextTopic.shortTitle || nextTopic.title) : 'Konec přehledu') + '</span>' +
            icon('arrow--right', 16) +
          '</button>' +
        '</nav>' +
      '</section>';

    renderTopicTabBody(document.getElementById('topic-tab-panel'), topic);

    document.getElementById('back-to-dashboard-btn').addEventListener('click', function () {
      navigateTo('dashboard');
    });

    document.getElementById('header-prev-topic-btn').addEventListener('click', function () {
      if (prevTopic) navigateTo('topic', { topicId: prevTopic.id, resetScene: true });
    });
    document.getElementById('header-next-topic-btn').addEventListener('click', function () {
      if (nextTopic) navigateTo('topic', { topicId: nextTopic.id, resetScene: true });
    });

    document.getElementById('topic-presentation-btn').addEventListener('click', function () {
      applyPresentation(!state.presentationMode);
    });

    document.getElementById('toggle-complete-btn').addEventListener('click', function () {
      var curDone = isTopicCompleted(topic);
      progress.manualCompleted[topic.id] = !curDone;
      saveProgress();
      var btn = document.getElementById('toggle-complete-btn');
      var nowDone = isTopicCompleted(topic);
      if (btn) {
        btn.classList.toggle('btn-ok', nowDone);
        btn.setAttribute('aria-pressed', nowDone ? 'true' : 'false');
        btn.innerHTML = icon(nowDone ? 'checkbox--checked' : 'checkbox', 16) +
          '<span>' + (nowDone ? 'Splněno' : 'Označit splněno') + '</span>';
      }
      showToast(nowDone ? 'Kapitola označena jako splněná.' : 'Označení zrušeno.');
    });

    document.getElementById('prev-topic-btn').addEventListener('click', function () {
      if (prevTopic) navigateTo('topic', { topicId: prevTopic.id, resetScene: true });
    });
    document.getElementById('next-topic-btn').addEventListener('click', function () {
      if (nextTopic) navigateTo('topic', { topicId: nextTopic.id, resetScene: true });
    });

    var tabBtns = Array.prototype.slice.call(root.querySelectorAll('[data-ttab]'));
    tabBtns.forEach(function (btn, tIdx) {
      btn.addEventListener('click', function () {
        var nextTab = btn.getAttribute('data-ttab');
        if (nextTab === state.topicTab) return;
        destroyActiveStage();
        state.topicTab = nextTab;
        tabBtns.forEach(function (b) {
          b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
        });
        var panel = document.getElementById('topic-tab-panel');
        panel.setAttribute('aria-labelledby', btn.id);
        renderTopicTabBody(panel, topic);
      });
      btn.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          var nextIdx = e.key === 'ArrowRight'
            ? (tIdx + 1) % tabBtns.length
            : (tIdx - 1 + tabBtns.length) % tabBtns.length;
          tabBtns[nextIdx].focus();
          tabBtns[nextIdx].click();
        }
      });
    });
  }

  function renderTopicTabBody(panel, topic) {
    if (!panel) return;
    destroyActiveStage();

    /* --- ZÁLOŽKA 1: UKÁZKA --- */
    if (state.topicTab === 'showcase') {
      var hasVideo = hasBundledVideo(topic);
      if (!state.sceneMode || (state.sceneMode === 'video' && !hasVideo)) {
        state.sceneMode = hasVideo ? 'video' : 'animation';
      }

      var topBarHtml = hasVideo
        ? '<div class="stage-top-bar">' +
            '<span class="muted" style="font-size:var(--text-xs);">' + (state.sceneMode === 'video' ? 'Video ukázka' : 'Interaktivní animace') + '</span>' +
            '<div class="segmented" role="group" aria-label="Režim ukázky">' +
              '<button type="button" class="segmented-btn ' + (state.sceneMode === 'video' ? 'is-active' : '') + '" data-scene="video">' +
                icon('video', 14) + '<span>Video</span>' +
              '</button>' +
              '<button type="button" class="segmented-btn ' + (state.sceneMode === 'animation' ? 'is-active' : '') + '" data-scene="animation">' +
                icon('play--outline', 14) + '<span>Interaktivní animace</span>' +
              '</button>' +
            '</div>' +
          '</div>'
        : '<div class="stage-top-bar">' +
            '<span class="badge badge-cyan">' + icon('play--outline', 14) + '<span>Interaktivní animace (Canvas)</span></span>' +
          '</div>';

      panel.innerHTML =
        '<div>' +
          topBarHtml +
          '<div id="showcase-stage-mount"></div>' +
        '</div>' +
        '<div class="key-points-box">' +
          '<div class="section-label">To nejdůležitější</div>' +
          '<ul class="key-points-list">' +
            (topic.takeaways || []).map(function (item) {
              return '<li><span class="key-point-icon">' + icon('checkmark--outline', 16) + '</span><span>' + esc(item) + '</span></li>';
            }).join('') +
          '</ul>' +
        '</div>' +
        (topic.tags && topic.tags.length
          ? '<div>' +
              '<div class="section-label" style="margin-bottom:var(--space-2);">Klíčové pojmy</div>' +
              '<div class="terms-row">' +
                topic.tags.map(function (tag) {
                  return '<button type="button" class="term-chip" data-tag="' + esc(tag) + '">' + esc(tag) + '</button>';
                }).join('') +
              '</div>' +
            '</div>'
          : '');

      renderShowcaseStage(document.getElementById('showcase-stage-mount'), topic);

      panel.querySelectorAll('[data-scene]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var mode = btn.getAttribute('data-scene');
          if (mode === state.sceneMode) return;
          destroyActiveStage();
          state.sceneMode = mode;
          renderTopicTabBody(panel, topic);
        });
      });

      panel.querySelectorAll('[data-tag]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          handleTagClick(btn.getAttribute('data-tag'), topic);
        });
      });
      return;
    }

    /* --- ZÁLOŽKA 2: PRINCIP --- */
    if (state.topicTab === 'principle') {
      var p = topic.principle || {};
      var expArr = Array.isArray(p.explanation) ? p.explanation : (p.explanation ? [p.explanation] : []);
      var steps = Array.isArray(p.steps) ? p.steps : [];
      var tbl = p.comparisonTable;
      var expLabel = expArr.length === 1 ? 'odstavec' : (expArr.length < 5 ? 'odstavce' : 'odstavců');

      panel.innerHTML =
        (p.problem
          ? '<div class="problem-summary">' +
              '<div class="section-label" style="margin-bottom:4px;">Řešený problém</div>' +
              '<p style="margin:0;">' + esc(p.problem) + '</p>' +
            '</div>'
          : '') +

        (topic.tags && topic.tags.length
          ? '<div>' +
              '<div class="section-label" style="margin-bottom:var(--space-2);">Klíčové pojmy (kliknutím zobrazíš definici)</div>' +
              '<div class="terms-row">' +
                topic.tags.map(function (tag) {
                  return '<button type="button" class="term-chip" data-tag="' + esc(tag) + '">' + esc(tag) + '</button>';
                }).join('') +
              '</div>' +
            '</div>'
          : '') +

        '<div class="acc-toolbar">' +
          '<span class="section-label" style="margin-bottom:0;">Podrobný princip</span>' +
          '<button type="button" class="btn btn-sm" id="toggle-all-accordions-btn">Rozbalit vše</button>' +
        '</div>' +

        '<div class="accordion-group" id="principle-accordions">' +
          (steps.length
            ? '<details class="acc-item" open>' +
                '<summary class="acc-summary"><span>Postup krok za krokem</span><span class="acc-chevron">' + icon('chevron--down', 16) + '</span></summary>' +
                '<div class="acc-body">' +
                  '<ol class="steps-clean">' +
                    steps.map(function (st, i) {
                      return '<li><span class="step-num">' + pad2(i + 1) + '</span><div><strong>' + esc(st.step) + '</strong><div class="muted">' + esc(st.detail) + '</div></div></li>';
                    }).join('') +
                  '</ol>' +
                '</div>' +
              '</details>'
            : '') +

          (expArr.length
            ? '<details class="acc-item">' +
                '<summary class="acc-summary"><span>Podrobný výklad (' + expArr.length + ' ' + expLabel + ')</span><span class="acc-chevron">' + icon('chevron--down', 16) + '</span></summary>' +
                '<div class="acc-body">' +
                  expArr.map(function (para) { return '<p>' + esc(para) + '</p>'; }).join('') +
                '</div>' +
              '</details>'
            : '') +

          (tbl && Array.isArray(tbl.headers) && Array.isArray(tbl.rows)
            ? '<details class="acc-item" open>' +
                '<summary class="acc-summary"><span>Srovnávací tabulka</span><span class="acc-chevron">' + icon('chevron--down', 16) + '</span></summary>' +
                '<div class="acc-body">' +
                  '<div class="table-scroll"><table class="data-table"><thead><tr>' +
                    tbl.headers.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') +
                    '</tr></thead><tbody>' +
                    tbl.rows.map(function (row) {
                      return '<tr>' + row.map(function (cell) { return '<td>' + esc(cell) + '</td>'; }).join('') + '</tr>';
                    }).join('') +
                  '</tbody></table></div>' +
                '</div>' +
              '</details>'
            : '') +

          (p.analogy
            ? '<details class="acc-item">' +
                '<summary class="acc-summary"><span>Analogie z praxe</span><span class="acc-chevron">' + icon('chevron--down', 16) + '</span></summary>' +
                '<div class="acc-body"><p style="margin:0;">' + esc(p.analogy) + '</p></div>' +
              '</details>'
            : '') +

          (p.watchOut
            ? '<details class="acc-item">' +
                '<summary class="acc-summary"><span class="inline-icon-label">' + icon('warning', 16) + '<span>Na co si dát pozor</span></span><span class="acc-chevron">' + icon('chevron--down', 16) + '</span></summary>' +
                '<div class="acc-body"><div class="warn-inline"><span>' + esc(p.watchOut) + '</span></div></div>' +
              '</details>'
            : '') +
        '</div>';

      panel.querySelectorAll('[data-tag]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          handleTagClick(btn.getAttribute('data-tag'), topic);
        });
      });

      var accGroup = document.getElementById('principle-accordions');
      var toggleAllBtn = document.getElementById('toggle-all-accordions-btn');
      if (accGroup && toggleAllBtn) {
        var accItems = Array.prototype.slice.call(accGroup.querySelectorAll('.acc-item'));
        function syncAccBtnLabel() {
          var allOpen = accItems.length > 0 && accItems.every(function (d) { return d.open; });
          toggleAllBtn.textContent = allOpen ? 'Sbalit vše' : 'Rozbalit vše';
        }
        syncAccBtnLabel();
        toggleAllBtn.addEventListener('click', function () {
          var allOpen = accItems.length > 0 && accItems.every(function (d) { return d.open; });
          accItems.forEach(function (d) { d.open = !allOpen; });
          syncAccBtnLabel();
        });
        accItems.forEach(function (d) {
          d.addEventListener('toggle', syncAccBtnLabel);
        });
      }
      return;
    }

    /* --- ZÁLOŽKA 3: LAB & PRAXE --- */
    if (state.topicTab === 'practice') {
      var ex = topic.example || {};
      var blocks = Array.isArray(ex.codeBlocks) ? ex.codeBlocks : [];

      panel.innerHTML =
        '<div id="topic-lab-mount"></div>' +
        '<div class="accordion-group">' +
          '<details class="acc-item" open>' +
            '<summary class="acc-summary"><span class="inline-icon-label">' + icon('code', 16) + '<span>Ukázky konfigurace a příklady: ' + esc(ex.scenarioTitle || 'Praxe') + '</span></span><span class="acc-chevron">' + icon('chevron--down', 16) + '</span></summary>' +
            '<div class="acc-body">' +
              (ex.scenarioText ? '<p>' + esc(ex.scenarioText) + '</p>' : '') +
              blocks.map(function (blk, bIdx) {
                return '<div class="terminal-block">' +
                  '<div class="terminal-head">' +
                    '<span>' + esc(blk.label || 'Konfigurace') + '</span>' +
                    '<button type="button" class="btn-copy-dark" data-copy-blk="' + bIdx + '">' + icon('copy', 14) + ' <span>Kopírovat</span></button>' +
                  '</div>' +
                  '<pre class="terminal-pre"><code>' + esc(blk.code || '') + '</code></pre>' +
                '</div>';
              }).join('') +
              (ex.practicalTip ? '<div class="callout callout-tip" style="margin-top:var(--space-3);"><strong>Tip z praxe:</strong> ' + esc(ex.practicalTip) + '</div>' : '') +
            '</div>' +
          '</details>' +
        '</div>';

      var mountEl = document.getElementById('topic-lab-mount');
      if (global.InteractiveLabs && typeof global.InteractiveLabs.mount === 'function') {
        global.InteractiveLabs.mount(mountEl, topic, {});
      }

      panel.querySelectorAll('[data-copy-blk]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var b = blocks[Number(btn.getAttribute('data-copy-blk'))];
          if (b) {
            copyText(b.code, 'Příkazy zkopírovány.');
            btn.innerHTML = icon('checkmark--outline', 14) + ' <span>Zkopírováno</span>';
            setTimeout(function () {
              if (btn.parentNode) {
                btn.innerHTML = icon('copy', 14) + ' <span>Kopírovat</span>';
              }
            }, 1600);
          }
        });
      });
      return;
    }

    /* --- ZÁLOŽKA 4: KVÍZ --- */
    renderTopicQuizBody(panel, topic);
  }

  function renderShowcaseStage(container, topic) {
    if (!container) return;
    destroyActiveStage();

    var vid = topic.video || {};
    var hasVideo = hasBundledVideo(topic);

    if (state.sceneMode === 'video' && hasVideo) {
      var videoSrc = safeMediaPath(vid.src);
      var posterSrc = safeMediaPath(vid.poster);
      var chapters = Array.isArray(vid.chapters) ? vid.chapters : [];
      var startTime = Number(vid.startTime) || 0;

      container.innerHTML =
        '<div class="stage-viewport">' +
          '<video id="topic-video-player" class="stage-video" controls playsinline preload="metadata"' +
            (posterSrc ? ' poster="' + esc(posterSrc) + '"' : '') +
            ' src="' + esc(videoSrc) + '"></video>' +
        '</div>' +
        (chapters.length > 0
          ? '<div class="video-chapters-row" aria-label="Časové kapitoly videa">' +
              chapters.map(function (ch, cIdx) {
                var lbl = String(ch.label || '');
                var hasTimeInLbl = /\(\d+:\d{2}\)/.test(lbl);
                return '<button type="button" class="chapter-pill" data-ch-time="' + Number(ch.time || 0) + '" data-ch-idx="' + cIdx + '">' +
                  (hasTimeInLbl ? icon('play', 12) : '<span class="mono">' + formatTimeMMSS(ch.time) + '</span>') +
                  '<span>' + esc(lbl) + '</span>' +
                '</button>';
              }).join('') +
            '</div>'
          : '') +
        (vid.transcript
          ? '<div class="accordion-group" style="margin-top:var(--space-3);">' +
              '<details class="acc-item">' +
                '<summary class="acc-summary"><span>Přepis komentáře</span><span class="acc-chevron">' + icon('chevron--down', 16) + '</span></summary>' +
                '<div class="acc-body">' + esc(vid.transcript) + '</div>' +
              '</details>' +
            '</div>'
          : '');

      var videoEl = document.getElementById('topic-video-player');
      var appliedInitialSeek = false;
      var pendingSeek = null;

      function safeSeek(targetSec) {
        try { videoEl.currentTime = targetSec; } catch (e) { /* ignore */ }
      }

      var chBtns = Array.prototype.slice.call(container.querySelectorAll('.chapter-pill'));
      function highlightActiveChapter(curSec) {
        if (!chBtns.length) return;
        var activeIdx = -1;
        for (var i = 0; i < chapters.length; i++) {
          if (curSec >= (Number(chapters[i].time) || 0) - 0.3) activeIdx = i;
        }
        chBtns.forEach(function (b, idx) {
          b.classList.toggle('is-active', idx === activeIdx);
        });
      }

      function applyInitialSeekIfReady() {
        if (appliedInitialSeek || pendingSeek !== null || startTime <= 0) return;
        if (videoEl.readyState >= 1) {
          appliedInitialSeek = true;
          safeSeek(startTime);
          highlightActiveChapter(startTime);
        }
      }

      videoEl.addEventListener('loadedmetadata', function () {
        if (pendingSeek !== null) {
          var target = pendingSeek;
          pendingSeek = null;
          appliedInitialSeek = true;
          safeSeek(target);
          highlightActiveChapter(target);
          var p = videoEl.play();
          if (p && typeof p.catch === 'function') p.catch(function () {});
        } else {
          applyInitialSeekIfReady();
        }
      });
      applyInitialSeekIfReady();
      highlightActiveChapter(startTime);

      chBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var t = Number(btn.getAttribute('data-ch-time')) || 0;
          appliedInitialSeek = true;
          if (videoEl.readyState >= 1) {
            safeSeek(t);
            highlightActiveChapter(t);
            var p = videoEl.play();
            if (p && typeof p.catch === 'function') p.catch(function () {});
          } else {
            pendingSeek = t;
            try { videoEl.load(); } catch (e) { /* ignore */ }
          }
        });
      });

      videoEl.addEventListener('timeupdate', function () {
        highlightActiveChapter(videoEl.currentTime);
      });
      return;
    }

    /* Režim Interaktivní animace (Canvas) */
    container.innerHTML =
      '<div class="stage-viewport">' +
        '<canvas id="topic-stage-canvas" class="stage-canvas" width="640" height="360"></canvas>' +
      '</div>' +
      '<div class="stage-player-bar">' +
        '<div class="stage-player-controls">' +
          '<button type="button" class="btn btn-sm btn-primary" id="anim-play-btn">' + icon('pause', 14) + ' <span>Pauza</span></button>' +
          '<button type="button" class="icon-btn" id="anim-prev-btn" aria-label="Předchozí krok">' + icon('chevron--left', 16) + '</button>' +
          '<div class="step-dots" id="anim-step-dots"></div>' +
          '<button type="button" class="icon-btn" id="anim-next-btn" aria-label="Další krok">' + icon('chevron--right', 16) + '</button>' +
          '<button type="button" class="btn btn-sm" id="anim-reset-btn">' + icon('restart', 14) + ' <span>Reset</span></button>' +
        '</div>' +
      '</div>' +
      '<div class="stage-caption-line" id="anim-caption">Načítání ukázky…</div>' +
      (!hasVideo && vid.transcript
        ? '<div class="accordion-group" style="margin-top:var(--space-3);">' +
            '<details class="acc-item">' +
              '<summary class="acc-summary"><span>Popis animace</span><span class="acc-chevron">' + icon('chevron--down', 16) + '</span></summary>' +
              '<div class="acc-body">' + esc(vid.transcript) + '</div>' +
            '</details>' +
          '</div>'
        : '');

    var canvas = document.getElementById('topic-stage-canvas');
    var playBtn = document.getElementById('anim-play-btn');
    var dotsEl = document.getElementById('anim-step-dots');
    var capEl = document.getElementById('anim-caption');
    var dotsBuilt = false;

    function syncAnimUi(st) {
      if (playBtn) {
        playBtn.innerHTML = st.isPlaying
          ? icon('pause', 14) + ' <span>Pauza</span>'
          : icon('play', 14) + ' <span>Přehrát</span>';
      }
      if (capEl) {
        capEl.innerHTML = '<strong>' + esc(st.stepTitle) + ':</strong> ' + esc(st.stepCaption);
      }
      if (dotsEl && st.steps) {
        if (!dotsBuilt) {
          dotsBuilt = true;
          dotsEl.innerHTML = st.steps.map(function (s, i) {
            return '<button type="button" class="step-dot-btn" data-step="' + i + '" aria-label="Krok ' + (i + 1) + '">' + (i + 1) + '</button>';
          }).join('');
          dotsEl.querySelectorAll('[data-step]').forEach(function (d) {
            d.addEventListener('click', function () {
              if (activeStageRenderer) activeStageRenderer.goToStep(Number(d.getAttribute('data-step')));
            });
          });
        }
        dotsEl.querySelectorAll('[data-step]').forEach(function (d, i) {
          d.classList.toggle('is-active', i === st.stepIndex);
        });
      }
    }

    if (global.PixelStageRenderer) {
      activeStageRenderer = global.PixelStageRenderer.create(canvas, topic.animationType, {
        onStateChange: syncAnimUi
      });
    }

    playBtn.addEventListener('click', function () {
      if (activeStageRenderer) activeStageRenderer.togglePlay();
    });
    document.getElementById('anim-prev-btn').addEventListener('click', function () {
      if (activeStageRenderer) activeStageRenderer.prevStep();
    });
    document.getElementById('anim-next-btn').addEventListener('click', function () {
      if (activeStageRenderer) activeStageRenderer.nextStep();
    });
    document.getElementById('anim-reset-btn').addEventListener('click', function () {
      if (activeStageRenderer && typeof activeStageRenderer.reset === 'function') {
        activeStageRenderer.reset();
      }
    });
  }

  function renderTopicQuizBody(panel, topic) {
    var quiz = Array.isArray(topic.quiz) ? topic.quiz : [];
    var saved = progress.quizAnswers[topic.id] || {};
    var qs = getTopicQuizStats(topic);
    var letters = ['A', 'B', 'C', 'D'];

    var tabQuizLabel = document.getElementById('tab-quiz-label');
    if (tabQuizLabel) {
      tabQuizLabel.textContent = 'Kvíz (' + qs.correct + '/' + qs.total + ')';
    }

    var completeBtn = document.getElementById('toggle-complete-btn');
    if (completeBtn) {
      var done = isTopicCompleted(topic);
      completeBtn.classList.toggle('btn-ok', done);
      completeBtn.setAttribute('aria-pressed', done ? 'true' : 'false');
      completeBtn.innerHTML = icon(done ? 'checkbox--checked' : 'checkbox', 16) +
        '<span>' + (done ? 'Splněno' : 'Označit splněno') + '</span>';
    }

    panel.innerHTML =
      '<div class="quiz-bar">' +
        '<span class="muted" style="font-size:var(--text-sm);">Správně <strong>' + qs.correct + '</strong> z ' + qs.total + '</span>' +
        '<button type="button" class="btn btn-sm" id="reset-topic-quiz"' + (qs.answered === 0 ? ' disabled' : '') + '>' + icon('restart', 14) + ' <span>Vymazat odpovědi</span></button>' +
      '</div>' +
      '<div class="quiz-list">' +
        quiz.map(function (q, qIdx) {
          var picked = saved[qIdx];
          var isAnswered = typeof picked === 'number' && Number.isInteger(picked) && picked >= 0 && Array.isArray(q.options) && picked < q.options.length;
          var isCorrect = isAnswered && picked === q.correctIndex;
          return '<div class="quiz-card">' +
            '<div class="quiz-q">' + (qIdx + 1) + '. ' + esc(q.question) + '</div>' +
            '<div class="quiz-opts">' +
              (q.options || []).map(function (opt, oIdx) {
                var cls = '';
                if (isAnswered) {
                  if (oIdx === q.correctIndex) cls = 'is-correct';
                  else if (oIdx === picked) cls = 'is-wrong';
                }
                return '<button type="button" class="quiz-opt ' + cls + '" data-q="' + qIdx + '" data-opt="' + oIdx + '"' + (isAnswered ? ' disabled' : '') + '>' +
                  '<span class="mono" style="color:var(--accent);font-weight:600;">' + letters[oIdx] + ')</span>' +
                  '<span>' + esc(opt) + '</span>' +
                '</button>';
              }).join('') +
            '</div>' +
            (isAnswered
              ? '<div class="quiz-feedback ' + (isCorrect ? 'is-correct' : 'is-wrong') + '">' +
                  '<strong>' + (isCorrect ? 'Správně.' : 'Nesprávně.') + '</strong> ' + esc(q.explanation || '') +
                '</div>'
              : '') +
          '</div>';
        }).join('') +
      '</div>';

    panel.querySelectorAll('[data-q]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var qIdx = Number(btn.getAttribute('data-q'));
        var oIdx = Number(btn.getAttribute('data-opt'));
        if (!progress.quizAnswers[topic.id]) progress.quizAnswers[topic.id] = {};
        progress.quizAnswers[topic.id][qIdx] = oIdx;
        saveProgress();
        renderTopicQuizBody(panel, topic);
        var nextOpt = panel.querySelector('.quiz-opt[data-q="' + (qIdx + 1) + '"]:not([disabled])') || panel.querySelector('.quiz-opt:not([disabled])') || document.getElementById('reset-topic-quiz');
        if (nextOpt && typeof nextOpt.focus === 'function') nextOpt.focus();
      });
    });

    var resetBtn = document.getElementById('reset-topic-quiz');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        delete progress.quizAnswers[topic.id];
        if (progress.manualCompleted[topic.id] !== true) {
          delete progress.manualCompleted[topic.id];
        }
        saveProgress();
        renderTopicQuizBody(panel, topic);
        var firstOpt = panel.querySelector('.quiz-opt:not([disabled])');
        if (firstOpt && typeof firstOpt.focus === 'function') firstOpt.focus();
        showToast('Odpovědi kvízu vymazány.');
      });
    }
  }

  /* ------------------------------------------------------------------------
     Pohled 3: Kalkulačka podsítí (#calc)
     ------------------------------------------------------------------------ */
  function generateSubnetChallenge() {
    var prefixes = [24, 25, 26, 27, 28, 29, 30];
    var p = prefixes[Math.floor(Math.random() * prefixes.length)];
    var templates = [
      '192.168.' + (10 + Math.floor(Math.random() * 80)) + '.',
      '172.16.' + (1 + Math.floor(Math.random() * 30)) + '.',
      '10.10.' + (1 + Math.floor(Math.random() * 50)) + '.'
    ];
    var base = templates[Math.floor(Math.random() * templates.length)];
    var blockSize = Math.pow(2, 32 - p);
    var subnetIdx = Math.floor(Math.random() * (256 / blockSize));
    var offset = 1 + Math.floor(Math.random() * Math.max(1, blockSize - 2));
    var ip = base + (subnetIdx * blockSize + offset);
    var solution = global.NetMath.calculateSubnet(ip, p);
    return { ip: ip, prefix: p, solution: solution };
  }

  function renderSubnettingView(root) {
    if (!state.trainerChallenge) {
      state.trainerChallenge = generateSubnetChallenge();
    }

    function buildBitOctetsHtml(res) {
      var html = '';
      for (var octIdx = 0; octIdx < 4; octIdx++) {
        var ipBits = res.ipBinaryOctets[octIdx];
        var decIp = res.inputIp.split('.')[octIdx];
        html += '<div class="octet-box">' +
          '<div class="octet-head"><span>Oktet ' + (octIdx + 1) + '</span><span>' + decIp + '</span></div>' +
          '<div class="octet-bits">';
        for (var b = 0; b < 8; b++) {
          var globalBit = octIdx * 8 + b;
          var isNet = globalBit < res.prefix;
          html += '<div class="bit-cell ' + (isNet ? 'bit-net' : 'bit-host') + '">' + ipBits[b] + '</div>';
        }
        html += '</div></div>';
      }
      return html;
    }

    function buildCalcOutputHtml() {
      var calc = global.NetMath && global.NetMath.calculateSubnet(state.subnetIp, state.subnetPrefix);
      if (!calc) {
        return '<div class="callout callout-warn" style="margin-bottom:var(--space-5);">Zadej platnou IPv4 adresu ve tvaru <code>x.x.x.x</code>.</div>';
      }
      var hostRange = calc.usableHosts === 0 ? '—' : (calc.firstHost === calc.lastHost ? calc.firstHost : calc.firstHost + ' – ' + calc.lastHost);
      return '<div class="table-scroll" style="margin-bottom:var(--space-5);">' +
        '<table class="data-table">' +
          '<thead><tr><th>Parametr</th><th>Hodnota</th></tr></thead>' +
          '<tbody>' +
            '<tr><td>Adresa sítě</td><td class="mono"><strong>' + calc.network + '/' + calc.prefix + '</strong></td></tr>' +
            '<tr><td>Maska podsítě</td><td class="mono">' + calc.mask + '</td></tr>' +
            '<tr><td>Wildcard maska</td><td class="mono">' + calc.wildcard + '</td></tr>' +
            '<tr><td>Rozsah hostů</td><td class="mono">' + hostRange + '</td></tr>' +
            '<tr><td>Broadcast</td><td class="mono">' + calc.broadcast + '</td></tr>' +
            '<tr><td>Použitelní hosté</td><td class="mono">' + calc.usableHosts.toLocaleString('cs-CZ') + ' (z ' + calc.totalAddresses.toLocaleString('cs-CZ') + ')</td></tr>' +
            '<tr><td>Typ rozsahu</td><td>' + esc(calc.classification.scope) + '</td></tr>' +
          '</tbody>' +
        '</table>' +
      '</div>' +
      '<div class="accordion-group" style="margin-bottom:var(--space-5);">' +
        '<details class="acc-item">' +
          '<summary class="acc-summary"><span>Binární rozklad 32 bitů (síť ' + calc.prefix + ' b / host ' + (32 - calc.prefix) + ' b)</span><span class="acc-chevron">' + icon('chevron--down', 16) + '</span></summary>' +
          '<div class="acc-body">' +
            '<div class="bits-grid">' + buildBitOctetsHtml(calc) + '</div>' +
          '</div>' +
        '</details>' +
      '</div>';
    }

    function buildTrainerHtml() {
      var ch = state.trainerChallenge;
      var hostsTrim = String(state.trainerInputs.hosts || '').trim();
      var hostsCorrect = hostsTrim !== '' && Number(hostsTrim) === ch.solution.usableHosts;
      return '<div class="accordion-group">' +
        '<details class="acc-item"' + (state.trainerChecked ? ' open' : '') + '>' +
          '<summary class="acc-summary"><span>Trenažér podsítění</span><span class="acc-chevron">' + icon('chevron--down', 16) + '</span></summary>' +
          '<div class="acc-body">' +
            '<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-2);margin-bottom:var(--space-3);">' +
              '<span>Zadání: <code style="font-weight:600;">' + esc(ch.ip) + '/' + ch.prefix + '</code></span>' +
              '<button type="button" class="btn btn-sm" id="new-challenge-btn">' + icon('restart', 14) + ' <span>Nový příklad</span></button>' +
            '</div>' +
            '<div class="trainer-grid">' +
              '<div><label class="field-label" for="tr-net">Adresa sítě</label><input id="tr-net" class="input mono ' + (state.trainerChecked ? (state.trainerInputs.net.trim() === ch.solution.network ? 'trainer-feedback-ok' : 'trainer-feedback-err') : '') + '" value="' + esc(state.trainerInputs.net) + '" placeholder="192.168.10.0" /></div>' +
              '<div><label class="field-label" for="tr-bcast">Broadcast</label><input id="tr-bcast" class="input mono ' + (state.trainerChecked ? (state.trainerInputs.bcast.trim() === ch.solution.broadcast ? 'trainer-feedback-ok' : 'trainer-feedback-err') : '') + '" value="' + esc(state.trainerInputs.bcast) + '" placeholder="192.168.10.63" /></div>' +
              '<div><label class="field-label" for="tr-first">První host</label><input id="tr-first" class="input mono ' + (state.trainerChecked ? (state.trainerInputs.first.trim() === ch.solution.firstHost ? 'trainer-feedback-ok' : 'trainer-feedback-err') : '') + '" value="' + esc(state.trainerInputs.first) + '" placeholder="192.168.10.1" /></div>' +
              '<div><label class="field-label" for="tr-hosts">Počet hostů</label><input id="tr-hosts" class="input mono ' + (state.trainerChecked ? (hostsCorrect ? 'trainer-feedback-ok' : 'trainer-feedback-err') : '') + '" value="' + esc(state.trainerInputs.hosts) + '" placeholder="62" /></div>' +
            '</div>' +
            '<div style="display:flex;flex-wrap:wrap;gap:var(--space-2);">' +
              '<button type="button" class="btn btn-sm btn-primary" id="check-challenge-btn">Zkontrolovat</button>' +
              '<button type="button" class="btn btn-sm" id="reveal-challenge-btn">Ukázat řešení</button>' +
            '</div>' +
            (state.trainerChecked
              ? '<div class="callout callout-tip" style="margin-top:var(--space-3);">' +
                  'Síť: <code>' + ch.solution.network + '</code> · Hosté: <code>' + ch.solution.firstHost + '–' + ch.solution.lastHost + '</code> (' + ch.solution.usableHosts + ') · Broadcast: <code>' + ch.solution.broadcast + '</code>' +
                '</div>'
              : '') +
          '</div>' +
        '</details>' +
      '</div>';
    }

    root.innerHTML =
      '<section id="view-calc" aria-label="Kalkulačka podsítí">' +
        '<div class="view-head">' +
          '<div><h1 class="view-title">Kalkulačka podsítí</h1><div class="muted" style="font-size:var(--text-sm);">IPv4 CIDR výpočet a trenažér</div></div>' +
          '<span id="calc-head-prefix" class="mono" style="font-weight:600;color:var(--accent);">/' + state.subnetPrefix + '</span>' +
        '</div>' +

        '<div class="calc-controls">' +
          '<div>' +
            '<label class="field-label" for="calc-ip-input">IPv4 adresa</label>' +
            '<input id="calc-ip-input" type="text" class="input mono" value="' + esc(state.subnetIp) + '" placeholder="192.168.10.42" />' +
          '</div>' +
          '<div>' +
            '<label class="field-label" for="calc-cidr-slider">Prefix: <span id="calc-slider-prefix" class="mono">/' + state.subnetPrefix + '</span></label>' +
            '<input id="calc-cidr-slider" type="range" class="cidr-slider" min="1" max="32" value="' + state.subnetPrefix + '" />' +
          '</div>' +
          '<div class="preset-row">' +
            [24, 25, 26, 27, 28, 30, 31, 32].map(function (p) {
              return '<button type="button" class="filter-chip mono ' + (state.subnetPrefix === p ? 'is-active' : '') + '" data-quick-cidr="' + p + '">/' + p + '</button>';
            }).join('') +
            ['192.168.10.42', '172.16.20.130', '10.0.5.77', '8.8.8.8'].map(function (ip) {
              return '<button type="button" class="filter-chip mono" data-quick-ip="' + ip + '">' + ip + '</button>';
            }).join('') +
          '</div>' +
        '</div>' +

        '<div id="calc-output">' + buildCalcOutputHtml() + '</div>' +
        '<div id="calc-trainer-mount">' + buildTrainerHtml() + '</div>' +
      '</section>';

    function updateCalcPartial() {
      var outEl = document.getElementById('calc-output');
      var headPref = document.getElementById('calc-head-prefix');
      var sliderPref = document.getElementById('calc-slider-prefix');
      var sliderEl = document.getElementById('calc-cidr-slider');
      if (headPref) headPref.textContent = '/' + state.subnetPrefix;
      if (sliderPref) sliderPref.textContent = '/' + state.subnetPrefix;
      if (sliderEl && Number(sliderEl.value) !== state.subnetPrefix) sliderEl.value = String(state.subnetPrefix);
      root.querySelectorAll('[data-quick-cidr]').forEach(function (b) {
        b.classList.toggle('is-active', Number(b.getAttribute('data-quick-cidr')) === state.subnetPrefix);
      });
      if (outEl) {
        var prevDet = outEl.querySelector('details');
        var wasOpen = Boolean(prevDet && prevDet.open);
        outEl.innerHTML = buildCalcOutputHtml();
        var nextDet = outEl.querySelector('details');
        if (nextDet && wasOpen) nextDet.open = true;
      }
    }

    function bindTrainerEvents() {
      var mountEl = document.getElementById('calc-trainer-mount');
      if (!mountEl) return;

      function syncTrainerInputs() {
        var netEl = document.getElementById('tr-net');
        var bcastEl = document.getElementById('tr-bcast');
        var firstEl = document.getElementById('tr-first');
        var hostsEl = document.getElementById('tr-hosts');
        if (netEl) state.trainerInputs.net = netEl.value;
        if (bcastEl) state.trainerInputs.bcast = bcastEl.value;
        if (firstEl) state.trainerInputs.first = firstEl.value;
        if (hostsEl) state.trainerInputs.hosts = hostsEl.value;
      }

      function refreshTrainer(forceOpen) {
        mountEl.innerHTML = buildTrainerHtml();
        if (forceOpen) {
          var det = mountEl.querySelector('.acc-item');
          if (det) det.open = true;
        }
        bindTrainerEvents();
      }

      ['tr-net', 'tr-bcast', 'tr-first', 'tr-hosts'].forEach(function (id) {
        var inpEl = document.getElementById(id);
        if (inpEl) {
          inpEl.addEventListener('input', syncTrainerInputs);
        }
      });

      var newBtn = document.getElementById('new-challenge-btn');
      if (newBtn) {
        newBtn.addEventListener('click', function () {
          state.trainerChallenge = generateSubnetChallenge();
          state.trainerInputs = { net: '', bcast: '', first: '', hosts: '' };
          state.trainerChecked = false;
          refreshTrainer(true);
        });
      }
      var checkBtn = document.getElementById('check-challenge-btn');
      if (checkBtn) {
        checkBtn.addEventListener('click', function () {
          syncTrainerInputs();
          state.trainerChecked = true;
          refreshTrainer(true);
        });
      }
      var revealBtn = document.getElementById('reveal-challenge-btn');
      if (revealBtn) {
        revealBtn.addEventListener('click', function () {
          var ch = state.trainerChallenge;
          state.trainerInputs = {
            net: ch.solution.network,
            bcast: ch.solution.broadcast,
            first: ch.solution.firstHost,
            hosts: String(ch.solution.usableHosts)
          };
          state.trainerChecked = true;
          refreshTrainer(true);
        });
      }
    }

    bindTrainerEvents();

    var ipInp = document.getElementById('calc-ip-input');
    ipInp.addEventListener('input', function (e) {
      state.subnetIp = e.target.value;
      updateCalcPartial();
    });
    ipInp.addEventListener('change', function (e) {
      state.subnetIp = e.target.value;
      updateCalcPartial();
    });
    document.getElementById('calc-cidr-slider').addEventListener('input', function (e) {
      state.subnetPrefix = Number(e.target.value);
      updateCalcPartial();
    });
    root.querySelectorAll('[data-quick-cidr]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.subnetPrefix = Number(b.getAttribute('data-quick-cidr'));
        updateCalcPartial();
      });
    });
    root.querySelectorAll('[data-quick-ip]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.subnetIp = b.getAttribute('data-quick-ip');
        ipInp.value = state.subnetIp;
        updateCalcPartial();
      });
    });
  }

  /* ------------------------------------------------------------------------
     Pohled 4: Slovníček A–Z (#glossary)
     ------------------------------------------------------------------------ */
  function renderGlossaryView(root) {
    var categories = [];
    glossary.forEach(function (item) {
      if (item.category && categories.indexOf(item.category) === -1) categories.push(item.category);
    });
    categories.sort(function (a, b) { return a.localeCompare(b, 'cs'); });

    function getFilteredGlossary() {
      var q = state.glossarySearch.trim().toLowerCase();
      return glossary.filter(function (item) {
        if (state.glossaryCategory !== 'all' && item.category !== state.glossaryCategory) return false;
        if (!q) return true;
        return (item.term + ' ' + item.shortDef + ' ' + item.detail).toLowerCase().indexOf(q) !== -1;
      }).sort(function (a, b) {
        return a.term.localeCompare(b.term, 'cs');
      });
    }

    function buildGlossaryHtml(filtered) {
      if (filtered.length === 0) {
        return '<div class="state-box"><p style="margin:0;">Žádný pojem neodpovídá filtru.</p></div>';
      }
      return '<div class="glossary-list">' +
        filtered.map(function (item, idx) {
          var relTopic = findTopic(item.relatedTopicId);
          return '<div class="glossary-row">' +
            '<button type="button" class="glossary-main-btn" data-g-idx="' + idx + '">' +
              '<span class="glossary-term">' + esc(item.term) + '</span>' +
              '<span class="glossary-short">' + esc(item.shortDef) + '</span>' +
            '</button>' +
            (relTopic
              ? '<button type="button" class="btn btn-sm glossary-topic-btn" data-goto-topic="' + esc(relTopic.id) + '" title="Otevřít kapitolu ' + pad2(relTopic.number) + '">' +
                  pad2(relTopic.number) + ' ' + esc(relTopic.shortTitle || relTopic.title) + ' ' + icon('arrow--right', 14) +
                '</button>'
              : '') +
          '</div>';
        }).join('') +
      '</div>';
    }

    var initialFiltered = getFilteredGlossary();

    root.innerHTML =
      '<section id="view-glossary" aria-label="Slovníček síťových pojmů">' +
        '<div class="view-head">' +
          '<div><h1 class="view-title">Slovníček pojmů</h1><div class="muted" style="font-size:var(--text-sm);">Kliknutím na pojem otevřeš podrobné vysvětlení</div></div>' +
          '<span id="glossary-count-badge" class="muted" style="font-size:var(--text-sm);">' + initialFiltered.length + ' z ' + glossary.length + ' pojmů</span>' +
        '</div>' +

        '<div class="filter-toolbar" style="margin-bottom:var(--space-5);">' +
          '<div class="toolbar-row">' +
            '<div class="search-wrap">' +
              '<span class="search-wrap-icon" aria-hidden="true">' + icon('search', 16) + '</span>' +
              '<input id="glossary-search-inp" type="search" class="input" placeholder="Hledat pojem (např. ARP, VLAN, NAT, SDN)…" value="' + esc(state.glossarySearch) + '" aria-label="Hledat ve slovníčku" />' +
              '<button type="button" id="glossary-clear-btn" class="search-wrap-clear" aria-label="Vymazat hledání"' + (state.glossarySearch ? '' : ' hidden') + '>' + icon('close', 16) + '</button>' +
            '</div>' +
          '</div>' +
          '<div class="chip-row">' +
            '<button type="button" class="filter-chip ' + (state.glossaryCategory === 'all' ? 'is-active' : '') + '" data-gcat="all">Vše</button>' +
            categories.map(function (c) {
              return '<button type="button" class="filter-chip ' + (state.glossaryCategory === c ? 'is-active' : '') + '" data-gcat="' + esc(c) + '">' + esc(c) + '</button>';
            }).join('') +
          '</div>' +
        '</div>' +

        '<div id="glossary-results">' + buildGlossaryHtml(initialFiltered) + '</div>' +
      '</section>';

    function bindRows(currentList) {
      var resEl = document.getElementById('glossary-results');
      if (!resEl) return;
      resEl.querySelectorAll('[data-g-idx]').forEach(function (b) {
        b.addEventListener('click', function () {
          var item = currentList[Number(b.getAttribute('data-g-idx'))];
          if (item) openGlossaryModal(item);
        });
      });
      resEl.querySelectorAll('[data-goto-topic]').forEach(function (b) {
        b.addEventListener('click', function (e) {
          e.stopPropagation();
          navigateTo('topic', { topicId: b.getAttribute('data-goto-topic'), resetScene: true });
        });
      });
    }

    function updateGlossary() {
      var filtered = getFilteredGlossary();
      var resEl = document.getElementById('glossary-results');
      var badgeEl = document.getElementById('glossary-count-badge');
      var clrBtn = document.getElementById('glossary-clear-btn');
      if (clrBtn) clrBtn.hidden = !state.glossarySearch;
      if (badgeEl) badgeEl.textContent = filtered.length + ' z ' + glossary.length + ' pojmů';
      if (resEl) {
        resEl.innerHTML = buildGlossaryHtml(filtered);
        bindRows(filtered);
      }
    }

    bindRows(initialFiltered);

    var gInp = document.getElementById('glossary-search-inp');
    gInp.addEventListener('input', function (e) {
      state.glossarySearch = e.target.value;
      updateGlossary();
    });
    var clr = document.getElementById('glossary-clear-btn');
    if (clr) {
      clr.addEventListener('click', function () {
        state.glossarySearch = '';
        if (gInp) {
          gInp.value = '';
          gInp.focus();
        }
        updateGlossary();
      });
    }
    root.querySelectorAll('[data-gcat]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.glossaryCategory = b.getAttribute('data-gcat');
        root.querySelectorAll('[data-gcat]').forEach(function (chip) {
          chip.classList.toggle('is-active', chip.getAttribute('data-gcat') === state.glossaryCategory);
        });
        updateGlossary();
      });
    });
  }

  /* ------------------------------------------------------------------------
     Pohled 5: Znalostní test (#test)
     ------------------------------------------------------------------------ */
  function buildExamQuestionPool(scope) {
    var pool = [];
    topics.forEach(function (t) {
      if (scope !== 'random10' && scope !== 'all' && t.moduleId !== scope) return;
      (t.quiz || []).forEach(function (q, idx) {
        pool.push({
          uid: t.id + '_' + idx,
          topicId: t.id,
          topicNumber: t.number,
          topicTitle: t.shortTitle || t.title,
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation
        });
      });
    });
    var shuffled = shuffleArray(pool);
    return scope === 'random10' ? shuffled.slice(0, 10) : shuffled;
  }

  function evaluateMastery(pct) {
    if (pct >= 85) return { label: 'Výborně', color: 'var(--ok)', badgeClass: 'badge-emerald' };
    if (pct >= 65) return { label: 'Zvládnuto', color: 'var(--accent)', badgeClass: 'badge-cyan' };
    return { label: 'K procvičení', color: 'var(--warn)', badgeClass: 'badge-amber' };
  }

  function renderExamView(root) {
    if (!state.examQuestions.length) {
      state.examQuestions = buildExamQuestionPool(state.examScope);
    }

    var letters = ['A', 'B', 'C', 'D'];
    var total = state.examQuestions.length;
    var answeredCount = Object.keys(state.examAnswers).length;
    var totalPoolCount = topics.reduce(function (acc, t) {
      return acc + (Array.isArray(t.quiz) ? t.quiz.length : 0);
    }, 0);

    var resultHtml = '';
    if (state.examSubmitted && total > 0) {
      var correct = 0;
      var weakMap = {};
      state.examQuestions.forEach(function (q) {
        if (state.examAnswers[q.uid] === q.correctIndex) correct++;
        else weakMap[q.topicId] = { id: q.topicId, number: q.topicNumber, title: q.topicTitle };
      });
      var pct = Math.round((correct / total) * 100);
      var mastery = evaluateMastery(pct);
      var weakList = Object.keys(weakMap).map(function (k) { return weakMap[k]; });

      resultHtml =
        '<div class="exam-result">' +
          '<div class="mastery-box" style="color:' + mastery.color + ';">' +
            '<span class="mastery-pct">' + pct + ' %</span>' +
            '<span class="mastery-lbl">Úspěšnost</span>' +
          '</div>' +
          '<div>' +
            '<h2 style="margin-bottom:6px;display:flex;align-items:center;gap:var(--space-2);flex-wrap:wrap;">' +
              '<span>' + correct + ' / ' + total + ' správně</span>' +
              '<span class="badge ' + mastery.badgeClass + '">' + esc(mastery.label) + '</span>' +
            '</h2>' +
            (weakList.length
              ? '<div class="muted" style="font-size:var(--text-sm);margin-bottom:8px;">Doporučené kapitoly k zopakování:</div>' +
                '<div style="display:flex;flex-wrap:wrap;gap:var(--space-2);">' +
                  weakList.map(function (wt) {
                    return '<button type="button" class="btn btn-sm" data-review-topic="' + esc(wt.id) + '">' + pad2(wt.number) + ' ' + esc(wt.title) + ' ' + icon('arrow--right', 14) + '</button>';
                  }).join('') +
                '</div>'
              : '<div class="muted" style="font-size:var(--text-sm);">Bez jediné chyby.</div>') +
          '</div>' +
        '</div>';
    }

    root.innerHTML =
      '<section id="view-test" aria-label="Znalostní test">' +
        '<div class="view-head">' +
          '<div><h1 class="view-title">Znalostní test</h1><div id="exam-answered-count" class="muted" style="font-size:var(--text-sm);">Zodpovězeno ' + answeredCount + ' z ' + total + ' otázek</div></div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:var(--space-2);align-items:center;">' +
            '<select id="exam-scope-select" class="select" style="width:auto;min-width:220px;" aria-label="Okruh testu">' +
              '<option value="random10"' + (state.examScope === 'random10' ? ' selected' : '') + '>Náhodných 10 otázek</option>' +
              modules.map(function (m, idx) {
                var mId = m.id || m.moduleId;
                return '<option value="' + esc(mId) + '"' + (state.examScope === mId ? ' selected' : '') + '>' + (idx + 1) + '. ' + esc(m.shortTitle || m.title) + '</option>';
              }).join('') +
              '<option value="all"' + (state.examScope === 'all' ? ' selected' : '') + '>Všech ' + totalPoolCount + ' otázek</option>' +
            '</select>' +
            '<button type="button" class="btn btn-sm" id="exam-restart-btn">' + icon('restart', 14) + ' <span>Nový test</span></button>' +
          '</div>' +
        '</div>' +

        resultHtml +

        '<div class="quiz-list">' +
          state.examQuestions.map(function (q, qIdx) {
            var picked = state.examAnswers[q.uid];
            var hasPick = typeof picked === 'number';
            return '<div class="quiz-card">' +
              '<div style="display:flex;justify-content:space-between;gap:var(--space-2);">' +
                '<span class="quiz-q">' + (qIdx + 1) + '. ' + esc(q.question) + '</span>' +
                '<span class="muted mono" style="font-size:var(--text-xs);flex-shrink:0;">' + pad2(q.topicNumber) + '</span>' +
              '</div>' +
              '<div class="quiz-opts">' +
                q.options.map(function (opt, oIdx) {
                  var cls = '';
                  if (state.examSubmitted) {
                    if (oIdx === q.correctIndex) cls = 'is-correct';
                    else if (hasPick && oIdx === picked) cls = 'is-wrong';
                  } else if (hasPick && oIdx === picked) {
                    cls = 'is-selected';
                  }
                  return '<button type="button" class="quiz-opt ' + cls + '" data-eq="' + esc(q.uid) + '" data-eo="' + oIdx + '"' + (state.examSubmitted ? ' disabled' : '') + '>' +
                    '<span class="mono" style="color:var(--accent);font-weight:600;">' + letters[oIdx] + ')</span><span>' + esc(opt) + '</span></button>';
                }).join('') +
              '</div>' +
              (state.examSubmitted
                ? '<div class="quiz-feedback ' + (picked === q.correctIndex ? 'is-correct' : 'is-wrong') + '"><strong>' + (picked === q.correctIndex ? 'Správně.' : (hasPick ? 'Nesprávně · správně: ' : 'Nezodpovězeno · správně: ') + letters[q.correctIndex] + ')') + '</strong> ' + esc(q.explanation || '') + '</div>'
                : '') +
            '</div>';
          }).join('') +
        '</div>' +

        (!state.examSubmitted && total > 0
          ? '<div style="margin-top:var(--space-6);padding-top:var(--space-4);border-top:1px solid var(--border-subtle);display:flex;justify-content:flex-end;">' +
              '<button type="button" class="btn btn-primary" id="exam-submit-btn">Vyhodnotit test</button>' +
            '</div>'
          : '') +
      '</section>';

    document.getElementById('exam-scope-select').addEventListener('change', function (e) {
      state.examScope = e.target.value;
      state.examQuestions = buildExamQuestionPool(state.examScope);
      state.examAnswers = {};
      state.examSubmitted = false;
      renderCurrentView();
    });
    document.getElementById('exam-restart-btn').addEventListener('click', function () {
      state.examQuestions = buildExamQuestionPool(state.examScope);
      state.examAnswers = {};
      state.examSubmitted = false;
      renderCurrentView();
    });
    root.querySelectorAll('[data-eq]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (state.examSubmitted) return;
        var eq = btn.getAttribute('data-eq');
        var eo = Number(btn.getAttribute('data-eo'));
        state.examAnswers[eq] = eo;
        var cardEl = btn.closest('.quiz-card');
        if (cardEl) {
          cardEl.querySelectorAll('[data-eq]').forEach(function (optBtn) {
            optBtn.classList.toggle('is-selected', Number(optBtn.getAttribute('data-eo')) === eo);
          });
        }
        var cntEl = document.getElementById('exam-answered-count');
        if (cntEl) {
          cntEl.textContent = 'Zodpovězeno ' + Object.keys(state.examAnswers).length + ' z ' + total + ' otázek';
        }
      });
    });
    var subBtn = document.getElementById('exam-submit-btn');
    if (subBtn) {
      subBtn.addEventListener('click', function () {
        state.examSubmitted = true;
        renderCurrentView();
        global.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
    root.querySelectorAll('[data-review-topic]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        navigateTo('topic', { topicId: btn.getAttribute('data-review-topic'), resetScene: true });
      });
    });
  }

  /* ------------------------------------------------------------------------
     Router & Bootstrap
     ------------------------------------------------------------------------ */
  function renderCurrentView() {
    var root = document.getElementById('view-root');
    if (!root) return;

    root.classList.toggle('is-dashboard', state.view === 'dashboard');

    if (!curriculum || !topics.length) {
      root.innerHTML = '<div class="state-box"><h1>Data nenalezena</h1><p>Chybí soubory v adresáři <code>js/</code>.</p></div>';
      return;
    }

    if (state.view === 'topic') renderTopicDetail(root);
    else if (state.view === 'calc') renderSubnettingView(root);
    else if (state.view === 'glossary') renderGlossaryView(root);
    else if (state.view === 'test') renderExamView(root);
    else renderDashboard(root);
  }

  function hydrateIcons() {
    var slots = [
      ['drawer-toggle-icon', 'side-panel--open', 18],
      ['drawer-close-icon', 'side-panel--close', 18],
      ['brand-icon-slot', 'network', 18],
      ['drawer-search-icon', 'search', 16],
      ['drawer-search-clear-icon', 'close', 16],
      ['modal-close-icon', 'close', 18]
    ];
    slots.forEach(function (s) {
      var el = document.getElementById(s[0]);
      if (el) el.innerHTML = icon(s[1], s[2]);
    });
    document.querySelectorAll('[data-mobile-icon]').forEach(function (el) {
      el.innerHTML = icon(el.getAttribute('data-mobile-icon'), 20);
    });
  }

  function initApp() {
    hydrateIcons();
    initTheme();
    initPresentation();
    updateGlobalProgressIndicators();

    var dToggle = document.getElementById('drawer-toggle');
    var dClose = document.getElementById('drawer-close');
    var dOverlay = document.getElementById('drawer-overlay');
    if (dToggle) dToggle.addEventListener('click', function () { setDrawerOpen(!state.drawerOpen); });
    if (dClose) dClose.addEventListener('click', function () { setDrawerOpen(false); });
    if (dOverlay) dOverlay.addEventListener('click', function () { setDrawerOpen(false); });

    var dSearch = document.getElementById('drawer-search-input');
    var dClear = document.getElementById('drawer-search-clear');
    if (dSearch) {
      dSearch.addEventListener('input', function (e) {
        state.drawerSearch = e.target.value;
        renderDrawerTree();
      });
    }
    if (dClear) {
      dClear.addEventListener('click', function () {
        state.drawerSearch = '';
        if (dSearch) {
          dSearch.value = '';
          dSearch.focus();
        }
        renderDrawerTree();
      });
    }

    document.querySelectorAll('[data-nav]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        navigateTo(btn.getAttribute('data-nav'));
      });
    });

    var modalClose = document.getElementById('modal-close');
    if (modalClose) modalClose.addEventListener('click', function () { closeModal(false); });
    var modalBackdrop = document.getElementById('app-modal');
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', function (e) {
        if (e.target === modalBackdrop) closeModal(false);
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (modalBackdrop && !modalBackdrop.hidden) {
          closeModal(false);
        } else if (state.drawerOpen) {
          setDrawerOpen(false);
          if (dToggle) dToggle.focus();
        }
      }
    });

    global.addEventListener('hashchange', handleHashChange);

    var initialParsed = parseHash(global.location.hash);
    state.view = initialParsed.view;
    if (initialParsed.view === 'topic' && initialParsed.topicId) {
      state.activeTopicId = initialParsed.topicId;
      progress.lastTopicId = initialParsed.topicId;
      saveProgress();
    }
    if (!initialParsed.canonical || !global.location.hash) {
      syncHashFromState(true);
    }

    updateNavHighlight();
    renderCurrentView();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})(window);
