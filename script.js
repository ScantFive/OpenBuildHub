'use strict';

/* ---------- Мобильное меню ---------- */
(function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;
  const label = toggle.querySelector('.visually-hidden');

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('open', open);
    label.textContent = open ? 'Закрыть меню' : 'Открыть меню';
  }

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
})();

/* ---------- Демонстрация форка ---------- */
(function initForkDemo() {
  const FIELDS = [
    ['purpose', 'Назначение'],
    ['skills', 'Навыки'],
    ['equipment', 'Снаряжение'],
    ['playstyle', 'Стиль игры'],
  ];

  const original = {
    title: 'Огненный чародей',
    author: 'Neroth',
    version: 'v2',
    thumb: 'О',
    purpose: 'PvE · эндгейм',
    skills: 'Огненная стрела, Метеор, Огненная стена, Телепорт, Огненный щит, Инферно',
    equipment: 'Посох Пылающего Ока, Корона Лидии, Амулет Пламени Сердца',
    playstyle: 'Огненная стена под пачку, Метеор сверху, Телепорт для перемещения.',
  };

  const builds = {
    original: { ...original, parent: null },
    pvp: {
      ...original,
      parent: 'original',
      title: 'Огненный чародей (PvP)',
      author: 'Mira',
      version: 'v1',
      purpose: 'PvP · Поля Ненависти',
      skills: 'Огненная стрела, Ледяная броня, Огненная стена, Телепорт, Ледяные оковы, Инферно',
      playstyle: 'Держим дистанцию: оковы → стена → добиваем стрелами.',
    },
    leveling: {
      ...original,
      parent: 'original',
      title: 'Огненный чародей — быстрая прокачка',
      author: 'Stormblade',
      version: 'v1',
      purpose: 'Прокачка 1–50',
      equipment: 'Любой посох с бонусом к Огненной стреле',
    },
  };
  builds.arena = {
    ...builds.pvp,
    parent: 'pvp',
    title: 'PvP-чародей для арены 3×3',
    author: 'Вы',
    version: 'v1',
    skills: 'Огненная стрела, Ледяная броня, Огненная стена, Телепорт, Ледяные оковы, Щит маны',
  };

  const els = {
    buttons: document.querySelectorAll('.thread-item[data-build]'),
    lineage: document.getElementById('demo-lineage'),
    title: document.getElementById('demo-title'),
    meta: document.getElementById('demo-meta'),
    tags: document.getElementById('demo-tags'),
    fields: document.getElementById('demo-fields'),
  };
  if (!els.fields) return;

  function rootOf(id) {
    let cur = id;
    while (builds[cur].parent) cur = builds[cur].parent;
    return cur;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function render(id) {
    const b = builds[id];
    const parent = b.parent ? builds[b.parent] : null;

    els.buttons.forEach((btn) => btn.setAttribute('aria-pressed', String(btn.dataset.build === id)));

    // Плашка происхождения: прямой источник и, если отличается, оригинал треда
    els.lineage.replaceChildren();
    els.lineage.hidden = !parent;
    if (parent) {
      const root = builds[rootOf(id)];
      els.lineage.append('⑂ Форк билда ', el('b', null, `«${parent.title}»`), ` от ${parent.author}`);
      if (root !== parent) {
        els.lineage.append(' · оригинал: ', el('b', null, `«${root.title}»`), ` от ${root.author}`);
      }
    }

    els.title.textContent = b.title;
    els.meta.textContent = `${b.author} · ${b.version} · Diablo IV · Сезон 5`;

    const changed = parent ? FIELDS.filter(([key]) => b[key] !== parent[key]).map(([key]) => key) : [];

    els.tags.replaceChildren(el('span', 'tag', 'Diablo IV'), el('span', 'tag', 'Чародей'), el('span', 'tag hl', b.purpose.split(' · ')[0]));

    els.fields.replaceChildren(
      ...FIELDS.map(([key, label]) => {
        const isChanged = changed.includes(key);
        const box = el('div', isChanged ? 'changed' : '');
        const dt = el('dt', null, label);
        if (isChanged) dt.append(el('span', 'changed-badge', 'изменено'));
        box.append(dt, el('dd', null, b[key]));
        return box;
      }),
    );
  }

  els.buttons.forEach((btn) => btn.addEventListener('click', () => render(btn.dataset.build)));
  render('original');
})();

/* ---------- Форма раннего доступа (без бэкенда) ---------- */
(function initJoinForm() {
  const form = document.getElementById('join-form');
  if (!form) return;
  const email = form.elements.email;
  const error = document.getElementById('email-error');
  const success = document.getElementById('join-success');

  function validate() {
    const value = email.value.trim();
    let message = '';
    if (!value) message = 'Введите адрес электронной почты.';
    else if (!email.checkValidity() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = 'Проверьте адрес: например, you@example.com.';
    error.textContent = message;
    email.setAttribute('aria-invalid', String(Boolean(message)));
    return !message;
  }

  email.addEventListener('input', () => {
    if (email.getAttribute('aria-invalid') === 'true') validate();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate()) {
      email.focus();
      return;
    }
    const game = form.elements.game.selectedOptions[0].textContent;
    form.hidden = true;
    success.textContent = `Спасибо! Приглашение придёт на ${email.value.trim()}. Начнём с билдов для ${game}.`;
    success.hidden = false;
    success.focus();
  });
})();

document.getElementById('year').textContent = String(new Date().getFullYear());
