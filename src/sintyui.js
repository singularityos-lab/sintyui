(function () {
  'use strict';

  const script = document.currentScript;
  const base = script ? new URL('../icons/', script.src).href : 'icons/';

  function sheet(text) {
    const s = new CSSStyleSheet();
    s.replaceSync(text);
    return s;
  }

  const motion = 'var(--motion-duration-small) var(--motion-curve-standard)';

  const buttonSheet = sheet(`
    :host { display: inline-block; }
    :host([hidden]) { display: none; }
    button {
      font: inherit;
      font-size: 13px;
      background-color: var(--sinty-card-bg);
      border: 1px solid var(--sinty-border-color);
      border-radius: 999px;
      color: var(--sinty-text-color);
      padding: 6px 12px;
      box-shadow: none;
      cursor: default;
      transition: background-color ${motion}, border-color ${motion};
    }
    button:hover { background-color: var(--sinty-card-hover-bg); }
    button:active { background-color: color-mix(in srgb, var(--sinty-text-color) 18%, transparent); }
    button:disabled { opacity: 0.5; }
    button:focus-visible { outline: 2px solid var(--sinty-focus-ring-color); outline-offset: 1px; }
    :host([pill]) button { padding: var(--sinty-pill-padding, 8px 20px); min-height: var(--sinty-pill-min-height, auto); font-weight: 600; }
    :host([variant="flat"]) button { background: none; border-color: transparent; }
    :host([variant="flat"]) button:hover { background-color: var(--sinty-card-hover-bg); }
    :host([variant="flat"]) button:active { background-color: var(--sinty-card-bg); }
    :host([variant="suggested"]) button {
      background-color: var(--sinty-accent-color);
      border-color: var(--sinty-accent-color);
      color: var(--sinty-accent-fg-color);
    }
    :host([variant="suggested"]) button:hover { background-color: color-mix(in srgb, var(--sinty-accent-color) 15%, white); }
    :host([variant="suggested"]) button:active { background-color: color-mix(in srgb, var(--sinty-accent-color) 15%, black); }
    :host([variant="destructive"]) button {
      background-color: var(--sinty-destructive-hover);
      border-color: var(--sinty-destructive-hover);
      color: var(--sinty-destructive-fg);
    }
  `);

  class SintyButton extends HTMLElement {
    static formAssociated = true;
    static observedAttributes = ['disabled', 'type'];

    constructor() {
      super();
      this.internals = this.attachInternals();
      const root = this.attachShadow({ mode: 'open', delegatesFocus: true });
      root.adoptedStyleSheets = [buttonSheet];
      this.button = document.createElement('button');
      this.button.part = 'button';
      this.button.type = 'button';
      this.button.append(document.createElement('slot'));
      root.append(this.button);
      this.button.addEventListener('click', () => {
        if (this.getAttribute('type') === 'submit' && this.internals.form) this.internals.form.requestSubmit();
      });
    }

    attributeChangedCallback() {
      this.button.disabled = this.hasAttribute('disabled');
    }
  }

  const switchSheet = sheet(`
    :host {
      display: inline-block;
      position: relative;
      box-sizing: border-box;
      min-width: 40px;
      min-height: 22px;
      width: 40px;
      height: 22px;
      border-radius: 9999px;
      background-color: color-mix(in srgb, var(--sinty-text-color) 15%, transparent);
      border: 1px solid var(--sinty-border-color);
      transition: background-color ${motion}, border-color ${motion};
      outline: none;
      vertical-align: middle;
    }
    :host([checked]) { background-color: var(--sinty-accent-color); border-color: var(--sinty-accent-color); }
    :host([disabled]) { opacity: 0.5; }
    :host(:focus-visible) { box-shadow: 0 0 0 2px var(--sinty-focus-ring-color); }
    .slider {
      position: absolute;
      top: 0;
      left: 0;
      margin: 2px;
      width: 16px;
      height: 16px;
      border-radius: 9999px;
      background-color: var(--sinty-text-color);
      transition: transform ${motion}, background-color 120ms ease-out;
    }
    :host([checked]) .slider { transform: translateX(18px); background-color: var(--sinty-accent-fg-color); }
  `);

  class SintySwitch extends HTMLElement {
    static observedAttributes = ['checked', 'disabled'];

    constructor() {
      super();
      const root = this.attachShadow({ mode: 'open' });
      root.adoptedStyleSheets = [switchSheet];
      const slider = document.createElement('span');
      slider.className = 'slider';
      slider.part = 'slider';
      root.append(slider);
      this.addEventListener('click', () => this.toggle());
      this.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          this.toggle();
        }
      });
    }

    connectedCallback() {
      this.setAttribute('role', 'switch');
      if (!this.hasAttribute('tabindex')) this.tabIndex = 0;
      this.sync();
    }

    attributeChangedCallback() {
      this.sync();
    }

    sync() {
      this.setAttribute('aria-checked', String(this.checked));
      this.setAttribute('aria-disabled', String(this.hasAttribute('disabled')));
    }

    get checked() {
      return this.hasAttribute('checked');
    }

    set checked(value) {
      this.toggleAttribute('checked', Boolean(value));
    }

    toggle() {
      if (this.hasAttribute('disabled')) return;
      this.checked = !this.checked;
      this.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  const groupSheet = sheet(`
    :host { display: block; }
    .card {
      background-color: var(--sinty-card-bg);
      border: 1px solid var(--sinty-border-color);
      border-radius: 12px;
      overflow: hidden;
    }
    header { padding: 8px 12px 2px; }
    header[hidden] { display: none; }
    .heading { font-size: 13px; font-weight: 600; margin: 0; }
    .description { font-size: 11px; opacity: 0.7; margin: 2px 0 0; }
    .description:empty { display: none; }
  `);

  class SintyGroup extends HTMLElement {
    static observedAttributes = ['heading', 'description'];

    constructor() {
      super();
      const root = this.attachShadow({ mode: 'open' });
      root.adoptedStyleSheets = [groupSheet];
      this.card = document.createElement('div');
      this.card.className = 'card';
      this.card.part = 'card';
      this.header = document.createElement('header');
      this.heading = document.createElement('h3');
      this.heading.className = 'heading';
      this.description = document.createElement('p');
      this.description.className = 'description';
      this.header.append(this.heading, this.description);
      const list = document.createElement('div');
      list.setAttribute('role', 'list');
      list.append(document.createElement('slot'));
      this.card.append(this.header, list);
      root.append(this.card);
    }

    attributeChangedCallback() {
      this.heading.textContent = this.getAttribute('heading') || '';
      this.description.textContent = this.getAttribute('description') || '';
      this.header.hidden = !this.heading.textContent && !this.description.textContent;
    }

    connectedCallback() {
      this.attributeChangedCallback();
    }
  }

  const rowSheet = sheet(`
    :host {
      display: flex;
      align-items: center;
      gap: 12px;
      min-height: 36px;
      box-sizing: border-box;
      padding: 7px 12px;
      border-bottom: 1px solid color-mix(in srgb, var(--sinty-text-color) 5%, transparent);
      transition: background-color 0.2s;
    }
    :host(:last-child) { border-bottom: 0; }
    :host(:hover) { background-color: color-mix(in srgb, var(--sinty-text-color) 5%, transparent); }
    :host([activatable]) { cursor: default; }
    :host(:focus-visible) { outline: 2px solid var(--sinty-focus-ring-color); outline-offset: -2px; }
    .text { flex: 1; min-width: 0; }
    .title { display: block; font-weight: 500; font-size: 13px; }
    .subtitle { display: block; font-size: 11px; margin-top: 1px; opacity: 0.7; }
    .subtitle:empty { display: none; }
  `);

  class SintyRow extends HTMLElement {
    static observedAttributes = ['heading', 'subtitle'];

    constructor() {
      super();
      const root = this.attachShadow({ mode: 'open' });
      root.adoptedStyleSheets = [rowSheet];
      const prefix = document.createElement('slot');
      prefix.name = 'prefix';
      const text = document.createElement('div');
      text.className = 'text';
      this.titleEl = document.createElement('span');
      this.titleEl.className = 'title';
      this.titleEl.part = 'title';
      this.subtitleEl = document.createElement('span');
      this.subtitleEl.className = 'subtitle';
      this.subtitleEl.part = 'subtitle';
      text.append(this.titleEl, this.subtitleEl);
      root.append(prefix, text, document.createElement('slot'));
      this.addEventListener('keydown', (e) => {
        if (this.hasAttribute('activatable') && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          this.click();
        }
      });
    }

    connectedCallback() {
      this.setAttribute('role', 'listitem');
      if (this.hasAttribute('activatable') && !this.hasAttribute('tabindex')) this.tabIndex = 0;
      this.attributeChangedCallback();
    }

    attributeChangedCallback() {
      this.titleEl.textContent = this.getAttribute('heading') || '';
      this.subtitleEl.textContent = this.getAttribute('subtitle') || '';
    }
  }

  const entrySheet = sheet(`
    :host { display: inline-block; }
    input {
      font: inherit;
      font-size: 13px;
      box-sizing: border-box;
      width: 100%;
      background-color: var(--sinty-card-bg);
      border: 1px solid var(--sinty-border-color);
      border-radius: 8px;
      padding: 6px 10px;
      min-height: 26px;
      color: var(--sinty-text-color);
      transition: border-color 0.12s ease, box-shadow 0.12s ease;
      outline: none;
    }
    input:focus {
      border-color: var(--sinty-focus-ring-color);
      box-shadow: 0 0 0 1px var(--sinty-focus-ring-color);
    }
    input:disabled { opacity: 0.5; }
    :host([error]) input {
      border-color: var(--sinty-error-color);
      box-shadow: 0 0 0 1px var(--sinty-error-color);
    }
  `);

  class SintyEntry extends HTMLElement {
    static formAssociated = true;
    static observedAttributes = ['placeholder', 'type', 'disabled', 'value', 'name', 'label'];

    constructor() {
      super();
      this.internals = this.attachInternals();
      const root = this.attachShadow({ mode: 'open', delegatesFocus: true });
      root.adoptedStyleSheets = [entrySheet];
      this.input = document.createElement('input');
      this.input.part = 'input';
      root.append(this.input);
      this.input.addEventListener('input', (e) => {
        e.stopPropagation();
        this.internals.setFormValue(this.input.value);
        this.dispatchEvent(new Event('input', { bubbles: true }));
      });
      this.input.addEventListener('change', () => this.dispatchEvent(new Event('change', { bubbles: true })));
    }

    attributeChangedCallback(name, _, value) {
      if (name === 'disabled') this.input.disabled = value !== null;
      else if (name === 'value') this.value = value || '';
      else if (name === 'label') this.input.setAttribute('aria-label', value || '');
      else if (value === null) this.input.removeAttribute(name);
      else this.input.setAttribute(name, value);
    }

    get value() {
      return this.input.value;
    }

    set value(v) {
      this.input.value = v;
      this.internals.setFormValue(v);
    }
  }

  const dialogSheet = sheet(`
    dialog {
      padding: 0;
      border-radius: 16px;
      border: 1px solid var(--sinty-border-color);
      background-color: var(--sinty-window-tint);
      color: var(--sinty-text-color);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.22), 0 6px 14px rgba(0, 0, 0, 0.34);
      min-width: 320px;
      max-width: min(560px, calc(100vw - 40px));
    }
    dialog::backdrop { background-color: color-mix(in srgb, var(--sinty-shadow-color) 55%, transparent); }
    .titlebar {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px 16px;
      min-height: 40px;
      box-sizing: border-box;
    }
    .title { font-weight: 600; font-size: 14px; margin: 0; }
    .content { padding: 0 20px 20px; }
    .actions { display: flex; justify-content: flex-end; gap: 12px; padding: 0 20px 20px; }
    .actions[hidden] { display: none; }
    ::slotted(sinty-button) { --sinty-pill-padding: 4px 16px; --sinty-pill-min-height: 20px; }
  `);

  class SintyDialog extends HTMLElement {
    static observedAttributes = ['heading'];

    constructor() {
      super();
      const root = this.attachShadow({ mode: 'open' });
      root.adoptedStyleSheets = [dialogSheet];
      this.dialog = document.createElement('dialog');
      this.dialog.part = 'dialog';
      const bar = document.createElement('div');
      bar.className = 'titlebar';
      this.titleEl = document.createElement('h2');
      this.titleEl.className = 'title';
      this.titleEl.id = 'title';
      bar.append(this.titleEl);
      const content = document.createElement('div');
      content.className = 'content';
      content.append(document.createElement('slot'));
      const actions = document.createElement('div');
      actions.className = 'actions';
      const slot = document.createElement('slot');
      slot.name = 'actions';
      actions.append(slot);
      actions.hidden = true;
      slot.addEventListener('slotchange', () => {
        actions.hidden = slot.assignedElements().length === 0;
      });
      this.dialog.setAttribute('aria-labelledby', 'title');
      this.dialog.append(bar, content, actions);
      root.append(this.dialog);
      this.dialog.addEventListener('close', () => {
        this.removeAttribute('open');
        this.dispatchEvent(new Event('close', { bubbles: true }));
      });
    }

    attributeChangedCallback() {
      this.titleEl.textContent = this.getAttribute('heading') || '';
    }

    get open() {
      return this.dialog.open;
    }

    show() {
      if (!this.dialog.open) this.dialog.showModal();
      this.setAttribute('open', '');
    }

    close(value) {
      this.dialog.close(value);
      this.removeAttribute('open');
    }
  }

  const iconSheet = sheet(`
    :host {
      display: inline-block;
      width: var(--sinty-icon-size, 16px);
      height: var(--sinty-icon-size, 16px);
      flex: none;
      background-color: currentColor;
      -webkit-mask: var(--sinty-icon-url) center / contain no-repeat;
      mask: var(--sinty-icon-url) center / contain no-repeat;
      vertical-align: middle;
    }
    :host([color]) {
      background: var(--sinty-icon-url) center / contain no-repeat;
      -webkit-mask: none;
      mask: none;
    }
    :host([hidden]) { display: none; }
  `);

  const accentKeys = ['back_depth', 'back_mid', 'back_top', 'back_bot', 'front_depth', 'rim', 'front', 'glow_a', 'glow_b', 'mark', 'mark_shade'];
  const accentIcons = new Map();
  let accentTemplate = null;

  function hexToOklch(hex) {
    const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    const [r, g, b] = [1, 3, 5].map((i) => lin(parseInt(hex.slice(i, i + 2), 16) / 255));
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    const a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
    const bb = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
    const h = (Math.atan2(bb, a) * 180) / Math.PI;
    return { l: 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s, c: Math.hypot(a, bb), h: h < 0 ? h + 360 : h };
  }

  function oklchToHex(lightness, chroma, hue) {
    const rgb = (c) => {
      const a = c * Math.cos((hue * Math.PI) / 180);
      const b = c * Math.sin((hue * Math.PI) / 180);
      const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
      const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
      const s = (lightness - 0.0894841775 * a - 1.2914855480 * b) ** 3;
      return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s];
    };
    let v = rgb(chroma);
    for (let i = 0; i < 80 && v.some((x) => x < -0.0001 || x > 1.0001); i++) {
      chroma *= 0.95;
      v = rgb(chroma);
    }
    const srgb = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
    return '#' + v.map((x) => Math.round(Math.min(1, Math.max(0, srgb(Math.min(1, Math.max(0, x))))) * 255).toString(16).padStart(2, '0')).join('');
  }

  function currentAccent() {
    const probe = document.createElement('span');
    probe.style.color = 'var(--sinty-accent-color)';
    probe.hidden = true;
    document.documentElement.append(probe);
    const parts = getComputedStyle(probe).color.match(/[\d.]+/g) || [];
    probe.remove();
    if (parts.length < 3) return null;
    return '#' + parts.slice(0, 3).map((x) => Math.round(parseFloat(x)).toString(16).padStart(2, '0')).join('');
  }

  function accentPalette(accentHex, data) {
    const t = data.template;
    const accent = hexToOklch(accentHex);
    const front = hexToOklch(t.front);
    const ratio = Math.min(1, Math.max(data.min_chroma_ratio, accent.c / front.c));
    const hue = accent.c < data.neutral_chroma ? front.h : accent.h;
    const out = {};
    for (const key of accentKeys) {
      const c = hexToOklch(t[key]);
      let offset = c.h - front.h + 180;
      offset = offset - Math.floor(offset / 360) * 360 - 180;
      out[key] = oklchToHex(c.l, c.c * ratio, hue + offset * data.hue_follow);
    }
    return out;
  }

  function accentIcon(url) {
    const accent = currentAccent();
    const key = url + '|' + accent;
    if (accentIcons.has(key)) return accentIcons.get(key);
    const job = (async () => {
      try {
        if (!accentTemplate) accentTemplate = fetch(SintyUI.iconBase + 'color/accent-template.json').then((r) => (r.ok ? r.json() : null)).catch(() => null);
        const data = await accentTemplate;
        if (!data || !accent) return url;
        const r = await fetch(url);
        if (!r.ok) return url;
        let text = await r.text();
        const lower = text.toLowerCase();
        const t = data.template;
        if (!lower.includes(t.front) || !lower.includes(t.back_top)) return url;
        const palette = accentPalette(accent, data);
        for (const k of accentKeys) text = text.replace(new RegExp(t[k], 'gi'), '\u0001' + k + '\u0001');
        for (const k of accentKeys) text = text.split('\u0001' + k + '\u0001').join(palette[k]);
        return URL.createObjectURL(new Blob([text], { type: 'image/svg+xml' }));
      } catch (e) {
        return url;
      }
    })();
    accentIcons.set(key, job);
    return job;
  }

  class SintyIcon extends HTMLElement {
    static observedAttributes = ['name', 'size', 'label', 'color'];

    constructor() {
      super();
      this.attachShadow({ mode: 'open' }).adoptedStyleSheets = [iconSheet];
    }

    attributeChangedCallback() {
      const name = this.getAttribute('name') || '';
      const valid = /^[a-z0-9-]+(\.[a-zA-Z0-9-]+)*$/.test(name);
      const color = this.hasAttribute('color');
      const url = valid ? `${SintyUI.iconBase}${color ? 'color/' : ''}${name}.svg` : '';
      this.request = url;
      if (!url) this.style.setProperty('--sinty-icon-url', 'none');
      else if (!color) this.style.setProperty('--sinty-icon-url', `url("${url}")`);
      else {
        this.style.setProperty('--sinty-icon-url', 'none');
        accentIcon(url).then((resolved) => {
          if (this.request === url) this.style.setProperty('--sinty-icon-url', `url("${resolved}")`);
        });
      }
      const size = parseInt(this.getAttribute('size') || '', 10);
      if (size > 0) this.style.setProperty('--sinty-icon-size', `${size}px`);
      const label = this.getAttribute('label');
      if (label) {
        this.setAttribute('role', 'img');
        this.setAttribute('aria-label', label);
      } else {
        this.setAttribute('aria-hidden', 'true');
      }
    }
  }

  const appSheet = sheet(`
    :host {
      display: block;
      position: relative;
      height: 100%;
      min-height: 0;
      overflow: hidden;
      background-color: var(--sinty-window-tint);
      color: var(--sinty-text-color);
    }
    .frame { display: flex; height: 100%; }
    aside {
      flex: none;
      box-sizing: border-box;
      width: var(--sinty-sidebar-width, 180px);
      display: flex;
      flex-direction: column;
      padding: 10px;
      gap: 2px;
      overflow-y: auto;
      background-color: var(--sinty-window-tint);
      border-right: 1px solid var(--sinty-border-color);
      z-index: 3;
      transition: transform var(--motion-duration-medium, 250ms) var(--motion-curve-standard, ease);
    }
    aside[hidden], :host([sidebar-hidden]:not([narrow])) aside { display: none; }
    .side-foot { margin-top: auto; padding-top: 10px; }
    .main { position: relative; flex: 1; min-width: 0; display: flex; flex-direction: column; background-color: rgba(0, 0, 0, 0.15); }
    .status { position: absolute; right: 13px; bottom: 12px; z-index: 1; font-size: 13px; opacity: 0.5; pointer-events: none; font-variant-numeric: tabular-nums; }
    .status:empty { display: none; }
    .bar {
      position: absolute;
      top: 10px;
      left: 10px;
      right: calc(10px + var(--sinty-scrollbar, 0px));
      z-index: 2;
      display: flex;
      align-items: center;
      gap: 4px;
      pointer-events: none;
    }
    .start { display: flex; align-items: center; gap: 4px; min-width: 0; flex: 1; }
    .start > *, .end > * { pointer-events: auto; }
    .end { display: flex; align-items: center; justify-content: flex-end; gap: 4px; min-width: 0; flex: 0 1 auto; }
    .scroll { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin; }
    .content {
      box-sizing: border-box;
      max-width: var(--sinty-content-width, 760px);
      margin: 0 auto;
      padding: 60px 24px 40px;
    }
    :host([wide]) .content { max-width: none; padding: 60px 12px 40px; }
    .toasts {
      position: absolute;
      left: 12px;
      right: 12px;
      bottom: 18px;
      z-index: 5;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      pointer-events: none;
    }
    .toasts > ::slotted(*) { pointer-events: auto; }
    .scrim { display: none; }
    :host([narrow]) aside {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      transform: translateX(-102%);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.22), 0 6px 14px rgba(0, 0, 0, 0.34);
    }
    :host([narrow][sidebar-open]) aside { transform: none; }
    :host([narrow][sidebar-open]) .scrim {
      display: block;
      position: absolute;
      inset: 0;
      z-index: 3;
      background-color: color-mix(in srgb, var(--sinty-shadow-color) 40%, transparent);
    }
    :host([narrow]) .content { padding: 60px 14px 40px; }
  `);

  class SintyApp extends HTMLElement {
    static observedAttributes = ['narrow-width', 'status'];

    constructor() {
      super();
      const root = this.attachShadow({ mode: 'open' });
      root.adoptedStyleSheets = [appSheet];
      const frame = document.createElement('div');
      frame.className = 'frame';
      this.aside = document.createElement('aside');
      this.aside.part = 'sidebar';
      const side = document.createElement('slot');
      side.name = 'sidebar';
      const foot = document.createElement('div');
      foot.className = 'side-foot';
      const footSlot = document.createElement('slot');
      footSlot.name = 'sidebar-footer';
      foot.append(footSlot);
      this.aside.append(side, foot);
      side.addEventListener('slotchange', () => {
        this.aside.hidden = side.assignedElements().length === 0 && footSlot.assignedElements().length === 0;
        this.toggle.hidden = this.aside.hidden;
      });
      this.aside.addEventListener('click', (e) => {
        if (this.hasAttribute('narrow') && e.composedPath().some((n) => n.localName === 'sinty-sidebar-row')) this.closeSidebar();
      });
      const main = document.createElement('div');
      main.className = 'main';
      const bar = document.createElement('div');
      bar.className = 'bar';
      bar.part = 'bar';
      const start = document.createElement('div');
      start.className = 'start';
      this.toggle = document.createElement('sinty-bubble');
      this.toggle.className = 'menu-toggle';
      this.toggle.setAttribute('icon', 'sidebar-show-symbolic');
      this.toggle.setAttribute('label', 'Hide Sidebar');
      this.toggle.addEventListener('click', () => this.toggleSidebar());
      const startSlot = document.createElement('slot');
      startSlot.name = 'start';
      start.append(startSlot);
      const end = document.createElement('div');
      end.className = 'end';
      const endSlot = document.createElement('slot');
      endSlot.name = 'bubbles';
      end.append(this.toggle, endSlot);
      bar.append(start, end);
      this.scroller = document.createElement('div');
      this.scroller.className = 'scroll';
      this.scroller.part = 'scroll';
      const content = document.createElement('div');
      content.className = 'content';
      content.part = 'content';
      content.append(document.createElement('slot'));
      this.scroller.append(content);
      this.statusEl = document.createElement('div');
      this.statusEl.className = 'status';
      this.statusEl.setAttribute('aria-live', 'polite');
      main.append(bar, this.scroller, this.statusEl);
      const scrim = document.createElement('div');
      scrim.className = 'scrim';
      scrim.addEventListener('click', () => this.closeSidebar());
      const toasts = document.createElement('div');
      toasts.className = 'toasts';
      const toastSlot = document.createElement('slot');
      toastSlot.name = 'toast';
      toasts.append(toastSlot);
      frame.append(this.aside, main);
      root.append(frame, scrim, toasts);
      this.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.hasAttribute('sidebar-open')) this.closeSidebar();
      });
      this.resize = new ResizeObserver(() => this.measure());
      this.gutter = new ResizeObserver(() => {
        this.style.setProperty('--sinty-scrollbar', (this.scroller.offsetWidth - this.scroller.clientWidth) + 'px');
      });
    }

    connectedCallback() {
      this.resize.observe(this);
      this.gutter.observe(this.scroller);
      this.measure();
    }

    disconnectedCallback() {
      this.resize.disconnect();
      this.gutter.disconnect();
    }

    attributeChangedCallback(name) {
      if (name === 'status') this.statusEl.textContent = this.getAttribute('status') || '';
      else this.measure();
    }

    syncToggle() {
      const shown = this.hasAttribute('narrow') ? this.hasAttribute('sidebar-open') : !this.hasAttribute('sidebar-hidden');
      this.toggle.setAttribute('label', shown ? 'Hide Sidebar' : 'Show Sidebar');
    }

    toggleSidebar() {
      if (this.hasAttribute('narrow')) {
        if (this.hasAttribute('sidebar-open')) this.closeSidebar(); else this.openSidebar();
      } else {
        this.toggleAttribute('sidebar-hidden');
        this.syncToggle();
      }
    }

    measure() {
      const limit = parseInt(this.getAttribute('narrow-width') || '720', 10);
      const narrow = this.clientWidth > 0 && this.clientWidth < limit;
      if (narrow !== this.hasAttribute('narrow')) {
        this.toggleAttribute('narrow', narrow);
        if (!narrow) this.removeAttribute('sidebar-open');
        this.syncToggle();
      }
    }

    openSidebar() {
      this.setAttribute('sidebar-open', '');
      this.syncToggle();
      const first = this.querySelector('[slot="sidebar"] [active], sinty-sidebar-row[active]');
      if (first) first.focus();
    }

    closeSidebar() {
      this.removeAttribute('sidebar-open');
      this.syncToggle();
    }

    scrollToTop() {
      this.scroller.scrollTop = 0;
    }
  }

  const sideRowSheet = sheet(`
    :host {
      display: flex;
      align-items: center;
      gap: 10px;
      box-sizing: border-box;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 13px;
      cursor: default;
      user-select: none;
      outline: none;
      transition: background-color 0.2s;
    }
    :host([hidden]) { display: none; }
    :host(:hover) { background-color: color-mix(in srgb, var(--sinty-accent-color) 10%, transparent); }
    :host([active]) { background-color: color-mix(in srgb, var(--sinty-accent-color) 15%, transparent); }
    :host(:focus-visible) { box-shadow: inset 0 0 0 2px var(--sinty-focus-ring-color); }
    :host([drop-target]) { background-color: color-mix(in srgb, var(--sinty-accent-color) 28%, transparent); }
    .label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .detail { font-size: 11px; opacity: 0.55; }
    .detail:empty { display: none; }
    .badge {
      box-sizing: border-box;
      min-width: 20px;
      min-height: 20px;
      padding: 0 6px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background-color: var(--sinty-accent-bg-color, var(--sinty-accent-color));
      color: var(--sinty-accent-fg-color);
      font-size: 11px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }
    .badge[hidden] { display: none; }
  `);

  class SintySidebarRow extends HTMLElement {
    static observedAttributes = ['icon', 'heading', 'detail', 'badge', 'active'];

    constructor() {
      super();
      const root = this.attachShadow({ mode: 'open' });
      root.adoptedStyleSheets = [sideRowSheet];
      this.iconEl = document.createElement('sinty-icon');
      this.labelEl = document.createElement('span');
      this.labelEl.className = 'label';
      this.detailEl = document.createElement('span');
      this.detailEl.className = 'detail';
      this.badgeEl = document.createElement('span');
      this.badgeEl.className = 'badge';
      root.append(this.iconEl, this.labelEl, this.detailEl, this.badgeEl, document.createElement('slot'));
      this.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      });
    }

    connectedCallback() {
      this.setAttribute('role', 'link');
      if (!this.hasAttribute('tabindex')) this.tabIndex = 0;
      this.attributeChangedCallback();
    }

    attributeChangedCallback() {
      const icon = this.getAttribute('icon');
      if (icon) this.iconEl.setAttribute('name', icon);
      this.iconEl.hidden = !icon;
      this.labelEl.textContent = this.getAttribute('heading') || '';
      this.setAttribute('aria-label', [this.getAttribute('heading'), this.getAttribute('badge')].filter((x) => x && x !== '0').join(', '));
      this.detailEl.textContent = this.getAttribute('detail') || '';
      const badge = this.getAttribute('badge') || '';
      this.badgeEl.textContent = badge;
      this.badgeEl.hidden = !badge || badge === '0';
      if (this.hasAttribute('active')) this.setAttribute('aria-current', 'page');
      else this.removeAttribute('aria-current');
    }
  }

  const sideLabelSheet = sheet(`
    :host {
      display: block;
      margin: 12px 0 2px 4px;
      padding: 0 8px;
      font-size: 10px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      opacity: 0.55;
    }
    :host(:first-child) { margin-top: 2px; }
  `);

  class SintySidebarLabel extends HTMLElement {
    constructor() {
      super();
      const root = this.attachShadow({ mode: 'open' });
      root.adoptedStyleSheets = [sideLabelSheet];
      root.append(document.createElement('slot'));
    }

    connectedCallback() {
      this.setAttribute('role', 'heading');
      this.setAttribute('aria-level', '2');
    }
  }

  const bubbleSheet = sheet(`
    :host { display: inline-block; flex: none; }
    :host([hidden]) { display: none; }
    button {
      font: inherit;
      box-sizing: content-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      min-width: 28px;
      min-height: 28px;
      padding: 0 10px;
      margin: 0;
      border-radius: 99px;
      background-color: var(--sinty-hover-btn-bg);
      border: 1px solid var(--sinty-hover-btn-border);
      color: var(--sinty-hover-btn-fg);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
      cursor: default;
      transition: background-color 0.12s ease, border-color 0.12s ease;
    }
    :host([icon]:not([text])) button { padding: 2px; }
    button:hover { background-color: var(--sinty-hover-btn-hover); }
    button:active { background-color: var(--sinty-hover-btn-active); }
    button:focus-visible { outline: 2px solid var(--sinty-focus-ring-color); outline-offset: 1px; }
    button:disabled { opacity: 0.5; }
    :host([checked]) button,
    :host([variant="suggested"]) button {
      background-color: var(--sinty-accent-bg-color, var(--sinty-accent-color));
      border-color: color-mix(in srgb, var(--sinty-accent-bg-color, var(--sinty-accent-color)) 85%, transparent);
      color: var(--sinty-accent-fg-color);
    }
    :host([checked]) button:hover,
    :host([variant="suggested"]) button:hover {
      background-color: color-mix(in srgb, var(--sinty-accent-bg-color, var(--sinty-accent-color)) 88%, var(--sinty-accent-fg-color));
    }
    sinty-icon { --sinty-icon-size: 12px; }
    sinty-icon[hidden] { display: none; }
    .text:empty { display: none; }
  `);

  class SintyBubble extends HTMLElement {
    static observedAttributes = ['icon', 'text', 'label', 'disabled', 'checked'];

    constructor() {
      super();
      const root = this.attachShadow({ mode: 'open', delegatesFocus: true });
      root.adoptedStyleSheets = [bubbleSheet];
      this.button = document.createElement('button');
      this.button.type = 'button';
      this.button.part = 'button';
      this.iconEl = document.createElement('sinty-icon');
      this.textEl = document.createElement('span');
      this.textEl.className = 'text';
      this.button.append(this.iconEl, this.textEl, document.createElement('slot'));
      root.append(this.button);
    }

    connectedCallback() {
      this.attributeChangedCallback();
    }

    attributeChangedCallback() {
      const icon = this.getAttribute('icon');
      if (icon) this.iconEl.setAttribute('name', icon);
      this.iconEl.hidden = !icon;
      this.textEl.textContent = this.getAttribute('text') || '';
      const label = this.getAttribute('label') || this.getAttribute('text') || '';
      if (label) this.button.setAttribute('aria-label', label);
      if (this.getAttribute('label')) this.button.title = this.getAttribute('label');
      this.button.disabled = this.hasAttribute('disabled');
      if (this.hasAttribute('toggle') || this.hasAttribute('checked')) this.button.setAttribute('aria-pressed', String(this.hasAttribute('checked')));
    }
  }

  const searchSheet = sheet(`
    :host { display: inline-block; min-width: 0; flex: none; }
    :host([hidden]) { display: none; }
    label {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      height: 34px;
      min-width: 34px;
      padding: 0;
      border-radius: 99px;
      background-color: var(--sinty-hover-btn-bg);
      border: 1px solid var(--sinty-hover-btn-border);
      color: var(--sinty-hover-btn-fg);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
      transition: border-color 0.12s ease;
    }
    label:hover { background-color: var(--sinty-hover-btn-hover); }
    label:focus-within { border-color: var(--sinty-focus-ring-color); background-color: var(--sinty-hover-btn-bg); }
    :host([open]) label { justify-content: flex-start; padding: 0 6px 0 11px; }
    sinty-icon { --sinty-icon-size: 12px; flex: none; }
    input {
      font: inherit;
      font-size: 12px;
      min-width: 0;
      width: 0;
      opacity: 0;
      position: absolute;
      background: transparent;
      border: 0;
      outline: none;
      padding: 0 6px;
      color: inherit;
      caret-color: currentColor;
    }
    :host([open]) input { position: static; opacity: 1; width: var(--sinty-search-width, 180px); }
    input::placeholder { color: inherit; opacity: 0.6; }
    input::-webkit-search-cancel-button { display: none; }
    button {
      display: none;
      border: 0;
      background: none;
      color: inherit;
      padding: 0;
      width: 18px;
      height: 18px;
      border-radius: 99px;
    }
    button:hover { background-color: color-mix(in srgb, currentColor 14%, transparent); }
    :host([has-value]) button { display: inline-grid; place-items: center; }
  `);

  class SintySearch extends HTMLElement {
    static observedAttributes = ['placeholder', 'value'];

    constructor() {
      super();
      const root = this.attachShadow({ mode: 'open', delegatesFocus: true });
      root.adoptedStyleSheets = [searchSheet];
      const label = document.createElement('label');
      const icon = document.createElement('sinty-icon');
      icon.setAttribute('name', 'edit-find-symbolic');
      this.input = document.createElement('input');
      this.input.type = 'search';
      this.input.part = 'input';
      const clear = document.createElement('button');
      clear.type = 'button';
      clear.setAttribute('aria-label', 'Clear');
      const x = document.createElement('sinty-icon');
      x.setAttribute('name', 'window-close-symbolic');
      x.style.setProperty('--sinty-icon-size', '10px');
      clear.append(x);
      clear.addEventListener('click', () => {
        this.value = '';
        this.dispatchEvent(new Event('input', { bubbles: true }));
        this.input.focus();
      });
      label.append(icon, this.input, clear);
      root.append(label);
      label.title = 'Search';
      this.addEventListener('focusin', () => this.setAttribute('open', ''));
      this.addEventListener('focusout', () => { if (!this.input.value) this.removeAttribute('open'); });
      this.input.addEventListener('input', (e) => {
        e.stopPropagation();
        this.toggleAttribute('has-value', !!this.input.value);
        this.dispatchEvent(new Event('input', { bubbles: true }));
      });
      this.input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.input.value) {
          e.stopPropagation();
          this.value = '';
          this.dispatchEvent(new Event('input', { bubbles: true }));
        } else if (e.key === 'Enter') {
          this.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    }

    attributeChangedCallback(name, _, value) {
      if (name === 'value') this.value = value || '';
      else {
        this.input.placeholder = value || '';
        this.input.setAttribute('aria-label', value || 'Search');
      }
    }

    get value() {
      return this.input.value;
    }

    set value(v) {
      this.input.value = v;
      this.toggleAttribute('has-value', !!v);
      if (v) this.setAttribute('open', '');
      else if (!this.matches(':focus-within')) this.removeAttribute('open');
    }

    focus() {
      this.setAttribute('open', '');
      this.input.focus();
    }
  }

  const statusSheet = sheet(`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      margin: 24px;
      padding-top: 48px;
      text-align: center;
    }
    :host([hidden]) { display: none; }
    :host([compact]) { gap: 6px; margin: 12px; padding-top: 12px; }
    sinty-icon { --sinty-icon-size: 64px; opacity: 0.35; }
    sinty-icon[color] { opacity: 1; }
    :host([compact]) sinty-icon { --sinty-icon-size: 48px; }
    sinty-icon[hidden] { display: none; }
    h2 { margin: 0; font-size: 20px; font-weight: 800; }
    :host([compact]) h2 { font-size: 15px; font-weight: 700; }
    p { margin: 0; max-width: 420px; opacity: 0.55; line-height: 1.45; }
    p:empty { display: none; }
    .child { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-top: 6px; }
  `);

  class SintyStatusPage extends HTMLElement {
    static observedAttributes = ['icon', 'heading', 'description', 'compact'];

    constructor() {
      super();
      const root = this.attachShadow({ mode: 'open' });
      root.adoptedStyleSheets = [statusSheet];
      this.iconEl = document.createElement('sinty-icon');
      this.titleEl = document.createElement('h2');
      this.descEl = document.createElement('p');
      const child = document.createElement('div');
      child.className = 'child';
      child.append(document.createElement('slot'));
      root.append(this.iconEl, this.titleEl, this.descEl, child);
    }

    connectedCallback() {
      this.attributeChangedCallback();
    }

    attributeChangedCallback() {
      const icon = this.getAttribute('icon');
      if (icon) this.iconEl.setAttribute('name', icon);
      this.iconEl.toggleAttribute('color', !!icon && !icon.endsWith('-symbolic'));
      this.iconEl.hidden = !icon;
      this.titleEl.textContent = this.getAttribute('heading') || '';
      this.descEl.textContent = this.getAttribute('description') || '';
    }
  }

  const toastSheet = sheet(`
    :host {
      display: flex;
      align-items: center;
      gap: 10px;
      box-sizing: border-box;
      max-width: min(520px, 100%);
      min-height: 36px;
      padding: 6px 6px 6px 16px;
      border-radius: 18px;
      background-color: rgba(0, 0, 0, 0.78);
      color: white;
      box-shadow: 0 4px 12px color-mix(in srgb, var(--sinty-shadow-color) 35%, transparent);
      font-size: 13px;
      animation: rise var(--motion-duration-medium, 250ms) var(--motion-curve-standard, ease);
    }
    :host([leaving]) { opacity: 0; transform: translateY(8px); transition: opacity 180ms ease, transform 180ms ease; }
    @keyframes rise { from { opacity: 0; transform: translateY(10px); } }
    .text { flex: 1; min-width: 0; }
    sinty-progress { width: 120px; }
    sinty-progress[hidden] { display: none; }
    button {
      font: inherit;
      font-size: 13px;
      font-weight: 600;
      color: white;
      background: none;
      border: 0;
      border-radius: 99px;
      padding: 3px 10px;
      white-space: nowrap;
    }
    button:hover { background-color: rgba(255, 255, 255, 0.14); }
    button[hidden] { display: none; }
    button.close { padding: 3px; display: inline-grid; place-items: center; width: 24px; height: 24px; }
    .close sinty-icon { --sinty-icon-size: 12px; }
  `);

  class SintyToast extends HTMLElement {
    constructor() {
      super();
      const root = this.attachShadow({ mode: 'open' });
      root.adoptedStyleSheets = [toastSheet];
      this.textEl = document.createElement('span');
      this.textEl.className = 'text';
      this.progressEl = document.createElement('sinty-progress');
      this.progressEl.hidden = true;
      this.actionEl = document.createElement('button');
      this.actionEl.type = 'button';
      this.actionEl.hidden = true;
      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'close';
      close.setAttribute('aria-label', 'Dismiss');
      const x = document.createElement('sinty-icon');
      x.setAttribute('name', 'window-close-symbolic');
      close.append(x);
      close.addEventListener('click', () => this.dismiss());
      this.actionEl.addEventListener('click', () => {
        if (this.onaction) this.onaction();
        this.dismiss();
      });
      root.append(this.textEl, this.progressEl, this.actionEl, close);
    }

    connectedCallback() {
      this.setAttribute('role', 'status');
    }

    set text(v) {
      this.textEl.textContent = v;
    }

    set progress(v) {
      this.progressEl.hidden = v === null || v === undefined;
      if (!this.progressEl.hidden) this.progressEl.value = v;
    }

    set action(label) {
      this.actionEl.textContent = label || '';
      this.actionEl.hidden = !label;
    }

    keep(ms) {
      clearTimeout(this.timer);
      if (ms > 0) this.timer = setTimeout(() => this.dismiss(), ms);
    }

    dismiss() {
      clearTimeout(this.timer);
      if (!this.isConnected || this.hasAttribute('leaving')) return;
      this.setAttribute('leaving', '');
      setTimeout(() => this.remove(), 200);
      this.dispatchEvent(new Event('dismiss'));
    }
  }

  function toast(text, options = {}) {
    const t = document.createElement('sinty-toast');
    t.text = text;
    t.action = options.action;
    t.onaction = options.onaction;
    if (options.progress !== undefined) t.progress = options.progress;
    t.slot = 'toast';
    const host = options.host || document.querySelector('sinty-app') || document.body;
    for (const old of host.querySelectorAll(':scope > sinty-toast')) if (!old.sticky) old.dismiss();
    t.sticky = options.timeout === 0;
    host.append(t);
    t.keep(options.timeout === undefined ? 4000 : options.timeout);
    return t;
  }

  const progressSheet = sheet(`
    :host { display: block; min-width: 40px; }
    .trough {
      position: relative;
      overflow: hidden;
      min-height: 6px;
      border-radius: 4px;
      background-color: var(--sinty-card-bg);
    }
    .fill {
      position: absolute;
      inset: 0 auto 0 0;
      width: 0;
      border-radius: 4px;
      background-color: var(--sinty-accent-color);
      transition: width var(--motion-duration-small, 150ms) linear;
    }
    :host([indeterminate]) .fill { width: 30%; animation: slide 1.2s ease-in-out infinite; }
    :host([level="warning"]) .fill { background-color: var(--sinty-warning-color); }
    :host([level="error"]) .fill { background-color: var(--sinty-error-color); }
    @keyframes slide { from { left: -30%; } to { left: 100%; } }
  `);

  class SintyProgress extends HTMLElement {
    static observedAttributes = ['value', 'label'];

    constructor() {
      super();
      const root = this.attachShadow({ mode: 'open' });
      root.adoptedStyleSheets = [progressSheet];
      const trough = document.createElement('div');
      trough.className = 'trough';
      trough.part = 'trough';
      this.fill = document.createElement('div');
      this.fill.className = 'fill';
      this.fill.part = 'fill';
      trough.append(this.fill);
      root.append(trough);
    }

    connectedCallback() {
      this.setAttribute('role', 'progressbar');
      this.setAttribute('aria-valuemin', '0');
      this.setAttribute('aria-valuemax', '100');
      this.attributeChangedCallback();
    }

    attributeChangedCallback() {
      const raw = this.getAttribute('value');
      const v = raw === null ? null : Math.max(0, Math.min(1, parseFloat(raw) || 0));
      this.toggleAttribute('indeterminate', v === null);
      this.fill.style.width = v === null ? '' : `${v * 100}%`;
      if (v === null) this.removeAttribute('aria-valuenow');
      else this.setAttribute('aria-valuenow', String(Math.round(v * 100)));
      const label = this.getAttribute('label');
      if (label) this.setAttribute('aria-label', label);
    }

    get value() {
      return parseFloat(this.getAttribute('value'));
    }

    set value(v) {
      if (v === null || v === undefined) this.removeAttribute('value');
      else this.setAttribute('value', String(v));
    }
  }

  const spinnerSheet = sheet(`
    :host {
      display: inline-block;
      box-sizing: border-box;
      width: var(--sinty-spinner-size, 16px);
      height: var(--sinty-spinner-size, 16px);
      border-radius: 50%;
      border: 2px solid color-mix(in srgb, currentColor 18%, transparent);
      border-top-color: currentColor;
      animation: spin 0.8s linear infinite;
      vertical-align: middle;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `);

  class SintySpinner extends HTMLElement {
    static observedAttributes = ['size'];

    constructor() {
      super();
      this.attachShadow({ mode: 'open' }).adoptedStyleSheets = [spinnerSheet];
    }

    connectedCallback() {
      this.setAttribute('role', 'progressbar');
      if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', 'Loading');
    }

    attributeChangedCallback() {
      const size = parseInt(this.getAttribute('size') || '', 10);
      if (size > 0) this.style.setProperty('--sinty-spinner-size', `${size}px`);
    }
  }

  const menuSheet = sheet(`
    :host {
      position: fixed;
      inset: auto;
      margin: 0;
      padding: 4px;
      max-width: calc(100vw - 16px);
      max-height: calc(100vh - 16px);
      overflow-y: auto;
      box-sizing: border-box;
      background-color: var(--sinty-surface-raised);
      color: var(--sinty-text-color);
      border: 1px solid color-mix(in srgb, var(--sinty-text-color) 10%, transparent);
      border-radius: 12px;
      box-shadow:
        0 1px 2px color-mix(in srgb, var(--sinty-shadow-color) 30%, transparent),
        0 6px 14px color-mix(in srgb, var(--sinty-shadow-color) 42%, transparent);
      font-family: 'Inter', sans-serif;
      font-size: 13px;
    }
    :host(:not(:popover-open)) { display: none; }
    ::slotted(hr) { border: 0; border-top: 1px solid var(--sinty-border-color); margin: 4px 2px; }
  `);

  class SintyMenu extends HTMLElement {
    constructor() {
      super();
      const root = this.attachShadow({ mode: 'open' });
      root.adoptedStyleSheets = [menuSheet];
      root.append(document.createElement('slot'));
      this.addEventListener('click', (e) => {
        const item = e.target.closest('sinty-menu-item');
        if (item && !item.hasAttribute('disabled')) this.close();
      });
      this.addEventListener('keydown', (e) => {
        const items = [...this.querySelectorAll('sinty-menu-item:not([disabled]):not([hidden])')];
        const at = items.indexOf(document.activeElement);
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          const next = e.key === 'ArrowDown' ? at + 1 : at - 1;
          (items[(next + items.length) % items.length] || items[0]).focus();
        }
      });
      this.addEventListener('toggle', (e) => {
        if (e.newState === 'closed' && this.anchor) {
          this.anchor.removeAttribute('aria-expanded');
          this.anchor = null;
        }
      });
    }

    connectedCallback() {
      this.setAttribute('popover', 'auto');
      this.setAttribute('role', 'menu');
    }

    open(anchor, point) {
      if (!this.isConnected) document.body.append(this);
      this.anchor = anchor || null;
      if (anchor) anchor.setAttribute('aria-expanded', 'true');
      this.showPopover();
      const w = this.offsetWidth;
      const h = this.offsetHeight;
      let x;
      let y;
      if (point) {
        x = point.x;
        y = point.y;
      } else {
        const r = anchor.getBoundingClientRect();
        x = r.right - w;
        y = r.bottom + 6;
        if (x < 8) x = r.left;
      }
      x = Math.max(8, Math.min(x, innerWidth - w - 8));
      if (y + h > innerHeight - 8) y = Math.max(8, (point ? point.y : anchor.getBoundingClientRect().top - 6) - h);
      this.style.left = `${x}px`;
      this.style.top = `${y}px`;
      const first = this.querySelector('sinty-menu-item:not([disabled]):not([hidden])');
      if (first) first.focus();
    }

    close() {
      if (this.matches(':popover-open')) this.hidePopover();
    }
  }

  const menuItemSheet = sheet(`
    :host {
      display: flex;
      align-items: center;
      gap: 10px;
      box-sizing: border-box;
      min-height: 28px;
      min-width: 180px;
      padding: 2px 8px;
      border-radius: 6px;
      cursor: default;
      outline: none;
      white-space: nowrap;
      transition: background-color 0.1s;
    }
    :host([hidden]) { display: none; }
    :host(:hover), :host(:focus-visible) { background-color: var(--sinty-card-hover-bg); }
    :host([disabled]) { opacity: 0.5; }
    :host([destructive]) { color: var(--sinty-error-color); }
    .label { flex: 1; }
    .accel { opacity: 0.5; font-size: 12px; }
    .accel:empty { display: none; }
    sinty-icon[hidden] { display: none; }
    .check { visibility: hidden; color: var(--sinty-accent-color); }
    :host([checked]) .check { visibility: visible; }
    .check[hidden] { display: none; }
  `);

  class SintyMenuItem extends HTMLElement {
    static observedAttributes = ['icon', 'heading', 'accel', 'checked', 'disabled'];

    constructor() {
      super();
      const root = this.attachShadow({ mode: 'open' });
      root.adoptedStyleSheets = [menuItemSheet];
      this.check = document.createElement('sinty-icon');
      this.check.className = 'check';
      this.check.setAttribute('name', 'object-select-symbolic');
      this.iconEl = document.createElement('sinty-icon');
      this.labelEl = document.createElement('span');
      this.labelEl.className = 'label';
      this.accelEl = document.createElement('span');
      this.accelEl.className = 'accel';
      root.append(this.check, this.iconEl, this.labelEl, this.accelEl);
      this.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      });
    }

    connectedCallback() {
      this.setAttribute('role', this.hasAttribute('checkable') ? 'menuitemradio' : 'menuitem');
      if (!this.hasAttribute('tabindex')) this.tabIndex = -1;
      this.attributeChangedCallback();
    }

    attributeChangedCallback() {
      const icon = this.getAttribute('icon');
      if (icon) this.iconEl.setAttribute('name', icon);
      this.iconEl.hidden = !icon;
      this.check.hidden = !this.hasAttribute('checkable');
      this.labelEl.textContent = this.getAttribute('heading') || '';
      this.setAttribute('aria-label', this.getAttribute('heading') || '');
      this.accelEl.textContent = this.getAttribute('accel') || '';
      if (this.hasAttribute('checkable')) this.setAttribute('aria-checked', String(this.hasAttribute('checked')));
      this.setAttribute('aria-disabled', String(this.hasAttribute('disabled')));
    }
  }

  function menu(items) {
    const m = document.createElement('sinty-menu');
    for (const it of items) {
      if (!it) {
        m.append(document.createElement('hr'));
        continue;
      }
      const row = document.createElement('sinty-menu-item');
      row.setAttribute('heading', it.label);
      if (it.icon) row.setAttribute('icon', it.icon);
      if (it.accel) row.setAttribute('accel', it.accel);
      if (it.destructive) row.setAttribute('destructive', '');
      if (it.disabled) row.setAttribute('disabled', '');
      if (it.checkable) row.setAttribute('checkable', '');
      if (it.checked) row.setAttribute('checked', '');
      if (it.run) row.addEventListener('click', () => { if (!row.hasAttribute('disabled')) it.run(); });
      m.append(row);
    }
    m.addEventListener('toggle', (e) => {
      if (e.newState === 'closed') setTimeout(() => m.remove(), 0);
    });
    return m;
  }

  const avatarPalette = ['#3584e4', '#2190a4', '#3a944a', '#c88800', '#ed5b00', '#e62d42', '#d56199', '#9141ac', '#6f8396'];

  const avatarSheet = sheet(`
    :host {
      display: inline-grid;
      place-items: center;
      flex: none;
      width: var(--sinty-avatar-size, 32px);
      height: var(--sinty-avatar-size, 32px);
      border-radius: 50%;
      background-color: var(--avatar-color, #6f8396);
      color: white;
      font-size: calc(var(--sinty-avatar-size, 32px) * 0.4);
      font-weight: 600;
      user-select: none;
      overflow: hidden;
    }
  `);

  class SintyAvatar extends HTMLElement {
    static observedAttributes = ['name', 'size'];

    constructor() {
      super();
      const root = this.attachShadow({ mode: 'open' });
      root.adoptedStyleSheets = [avatarSheet];
      this.text = document.createElement('span');
      root.append(this.text);
    }

    attributeChangedCallback() {
      const name = (this.getAttribute('name') || '').trim();
      const words = name.split(/[\s._-]+/).filter(Boolean);
      this.text.textContent = (words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2)).toUpperCase();
      let h = 0;
      for (const ch of name) h = (h * 31 + ch.codePointAt(0)) >>> 0;
      this.style.setProperty('--avatar-color', avatarPalette[h % avatarPalette.length]);
      const size = parseInt(this.getAttribute('size') || '', 10);
      if (size > 0) this.style.setProperty('--sinty-avatar-size', `${size}px`);
      this.setAttribute('role', 'img');
      this.setAttribute('aria-label', name);
    }
  }

  const segSheet = sheet(`
    :host {
      display: inline-flex;
      box-sizing: border-box;
      padding: 2px;
      gap: 2px;
      border-radius: 8px;
      background-color: color-mix(in srgb, var(--sinty-text-color) 6%, transparent);
    }
    :host([bubble]) {
      flex: none;
      height: 34px;
      align-items: center;
      gap: 0;
      border-radius: 99px;
      background-color: var(--sinty-hover-btn-bg);
      border: 1px solid var(--sinty-hover-btn-border);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
    }
    :host([hidden]) { display: none; }
    ::slotted(button) {
      font: inherit;
      font-size: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      min-height: 24px;
      min-width: 0;
      padding: 2px 14px;
      border: 0;
      border-radius: 6px;
      background-color: transparent;
      color: color-mix(in srgb, var(--sinty-window-fg-color, var(--sinty-text-color)) 65%, transparent);
      cursor: default;
      transition: background-color 0.15s ease, color 0.15s ease;
    }
    :host([bubble]) ::slotted(button) { border-radius: 20px; min-height: 28px; padding: 0 10px; color: color-mix(in srgb, var(--sinty-hover-btn-fg) 60%, transparent); }
    :host([bubble]) ::slotted(button:hover) { color: var(--sinty-hover-btn-fg); background-color: transparent; }
    :host([bubble]) ::slotted(button[aria-pressed="true"]) { background-color: color-mix(in srgb, var(--sinty-hover-btn-fg) 12%, transparent); color: var(--sinty-hover-btn-fg); font-weight: 500; box-shadow: none; }
    ::slotted(button:hover) { color: var(--sinty-window-fg-color, var(--sinty-text-color)); background-color: color-mix(in srgb, var(--sinty-text-color) 4%, transparent); }
    ::slotted(button[aria-pressed="true"]) {
      background-color: var(--sinty-accent-color);
      color: var(--sinty-accent-fg-color);
      font-weight: 600;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
    }
  `);

  class SintySegmented extends HTMLElement {
    static observedAttributes = ['value'];

    constructor() {
      super();
      const root = this.attachShadow({ mode: 'open' });
      root.adoptedStyleSheets = [segSheet];
      const slot = document.createElement('slot');
      slot.addEventListener('slotchange', () => this.attributeChangedCallback());
      root.append(slot);
      this.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b || b.parentElement !== this) return;
        this.value = b.value;
        this.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }

    connectedCallback() {
      this.setAttribute('role', 'group');
      this.attributeChangedCallback();
    }

    attributeChangedCallback() {
      const v = this.getAttribute('value');
      for (const b of this.querySelectorAll(':scope > button')) {
        b.type = 'button';
        b.setAttribute('aria-pressed', String(b.value === v));
      }
    }

    get value() {
      return this.getAttribute('value');
    }

    set value(v) {
      this.setAttribute('value', v);
    }
  }

  const pathSheet = sheet(`
    :host {
      display: inline-flex;
      align-items: center;
      box-sizing: border-box;
      height: 34px;
      min-width: 0;
      max-width: var(--sinty-path-width, 420px);
      padding: 2px;
      overflow: hidden;
      border-radius: 99px;
      background-color: var(--sinty-hover-btn-bg);
      border: 1px solid var(--sinty-hover-btn-border);
      color: var(--sinty-hover-btn-fg);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
    }
    :host([hidden]) { display: none; }
    button {
      font: inherit;
      font-size: 12px;
      flex: 0 1 auto;
      min-width: 0;
      height: 28px;
      padding: 0 10px;
      border: 0;
      border-radius: 20px;
      background: none;
      color: color-mix(in srgb, var(--sinty-hover-btn-fg) 85%, transparent);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: default;
      display: inline-flex;
      align-items: center;
    }
    button:last-of-type { flex: none; max-width: 220px; color: var(--sinty-hover-btn-fg); }
    button.icon { flex: none; padding: 0 9px; }
    button:hover, button.drop-target { background-color: color-mix(in srgb, var(--sinty-hover-btn-fg) 12%, transparent); }
    button:focus-visible { outline: 2px solid var(--sinty-focus-ring-color); outline-offset: -2px; }
    sinty-icon { --sinty-icon-size: 12px; }
    .sep { flex: none; font-size: 12px; padding: 0 1px; color: color-mix(in srgb, var(--sinty-text-color) 30%, transparent); }
  `);

  class SintyPath extends HTMLElement {
    constructor() {
      super();
      const root = this.attachShadow({ mode: 'open' });
      root.adoptedStyleSheets = [pathSheet];
      this.list = [];
    }

    connectedCallback() {
      this.setAttribute('role', 'navigation');
      if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', 'Location');
    }

    get segments() {
      return this.list;
    }

    set segments(list) {
      this.list = list || [];
      const root = this.shadowRoot;
      root.replaceChildren();
      this.list.forEach((seg, i) => {
        if (i > 0) {
          const sep = document.createElement('span');
          sep.className = 'sep';
          sep.setAttribute('aria-hidden', 'true');
          sep.textContent = '/';
          root.append(sep);
        }
        const b = document.createElement('button');
        b.type = 'button';
        b.part = 'segment';
        b.dataset.index = String(i);
        if (seg.icon) {
          const ic = document.createElement('sinty-icon');
          ic.setAttribute('name', seg.icon);
          b.append(ic);
          b.className = 'icon';
          b.setAttribute('aria-label', seg.label);
          b.title = seg.label;
        } else {
          b.textContent = seg.label;
          b.title = seg.label;
        }
        if (i === this.list.length - 1) b.setAttribute('aria-current', 'location');
        b.addEventListener('click', () => this.dispatchEvent(new CustomEvent('navigate', { bubbles: true, detail: seg })));
        root.append(b);
      });
    }

    get buttons() {
      return [...this.shadowRoot.querySelectorAll('button')];
    }
  }

  const separatorSheet = sheet(`
    :host { display: block; height: 1px; margin: 8px 2px; background-color: color-mix(in srgb, var(--sinty-text-color) 8%, transparent); }
  `);

  class SintySidebarSeparator extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' }).adoptedStyleSheets = [separatorSheet];
    }

    connectedCallback() {
      this.setAttribute('role', 'separator');
    }
  }

  const SintyUI = {
    iconBase: base,
    elements: {
      'sinty-button': SintyButton,
      'sinty-switch': SintySwitch,
      'sinty-group': SintyGroup,
      'sinty-row': SintyRow,
      'sinty-entry': SintyEntry,
      'sinty-dialog': SintyDialog,
      'sinty-icon': SintyIcon,
      'sinty-app': SintyApp,
      'sinty-sidebar-row': SintySidebarRow,
      'sinty-sidebar-label': SintySidebarLabel,
      'sinty-bubble': SintyBubble,
      'sinty-search': SintySearch,
      'sinty-status-page': SintyStatusPage,
      'sinty-toast': SintyToast,
      'sinty-progress': SintyProgress,
      'sinty-spinner': SintySpinner,
      'sinty-menu': SintyMenu,
      'sinty-menu-item': SintyMenuItem,
      'sinty-avatar': SintyAvatar,
      'sinty-segmented': SintySegmented,
      'sinty-path': SintyPath,
      'sinty-sidebar-separator': SintySidebarSeparator,
    },
    toast,
    menu,
  };

  for (const [name, element] of Object.entries(SintyUI.elements)) {
    if (!customElements.get(name)) customElements.define(name, element);
  }
  window.SintyUI = SintyUI;
})();
