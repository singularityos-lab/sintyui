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
      this.input.addEventListener('input', () => {
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
  `);

  class SintyIcon extends HTMLElement {
    static observedAttributes = ['name', 'size', 'label'];

    constructor() {
      super();
      this.attachShadow({ mode: 'open' }).adoptedStyleSheets = [iconSheet];
    }

    attributeChangedCallback() {
      const name = this.getAttribute('name') || '';
      const valid = /^[a-z0-9-]+$/.test(name);
      this.style.setProperty('--sinty-icon-url', valid ? `url("${SintyUI.iconBase}${name}.svg")` : 'none');
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
    },
  };

  for (const [name, element] of Object.entries(SintyUI.elements)) {
    if (!customElements.get(name)) customElements.define(name, element);
  }
  window.SintyUI = SintyUI;
})();
