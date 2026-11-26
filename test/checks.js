(async function () {
  const out = { styles: {}, checks: {} };
  const $ = (id) => document.getElementById(id);
  const shadow = (id, sel) => $(id).shadowRoot.querySelector(sel);
  const style = (el, props) => {
    const cs = getComputedStyle(el);
    const o = {};
    for (const p of props) o[p] = cs.getPropertyValue(p);
    return o;
  };
  const box = ['border-top-left-radius', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'min-height', 'min-width', 'font-size', 'font-weight', 'background-color', 'color', 'border-top-color'];

  out.styles.button = style(shadow('plain', 'button'), box);
  out.styles.pill = style(shadow('suggested', 'button'), box);
  out.styles.destructive = style(shadow('destructive', 'button'), box);
  out.styles.dialogButton = style(shadow('dialog-button', 'button'), box);
  out.styles.switch = style($('switch'), box);
  out.styles.entry = style(shadow('entry', 'input'), box);
  out.styles.group = style(shadow('group', '.card'), box);
  out.styles.groupHeader = style(shadow('group', 'header'), box);
  out.styles.groupHeading = style(shadow('group', '.heading'), box);
  out.styles.row = style($('row'), box);
  out.styles.rowTitle = style(shadow('row', '.title'), box);
  out.styles.rowSubtitle = style(shadow('row', '.subtitle'), box);
  out.styles.lastRowBorder = getComputedStyle($('last')).getPropertyValue('border-bottom-width');
  out.styles.rowBorder = getComputedStyle($('row')).getPropertyValue('border-bottom-width');

  const probe = document.createElement('div');
  document.body.append(probe);
  const resolve = (v) => {
    probe.style.color = v;
    return getComputedStyle(probe).color;
  };
  out.checks.suggestedIsAccent = out.styles.pill['background-color'] === resolve('var(--sinty-accent-color)');
  document.documentElement.setAttribute('data-sinty-accent', 'teal');
  out.checks.tealAccent = getComputedStyle(shadow('suggested', 'button')).backgroundColor;
  document.documentElement.setAttribute('data-sinty-theme', 'dark');
  out.checks.darkText = getComputedStyle(document.body).color;
  out.checks.darkTealAccent = getComputedStyle(shadow('suggested', 'button')).backgroundColor;
  document.documentElement.setAttribute('data-sinty-theme', 'light');
  document.documentElement.removeAttribute('data-sinty-accent');
  out.checks.lightText = getComputedStyle(document.body).color;

  const sw = $('switch');
  let changes = 0;
  sw.addEventListener('change', () => changes++);
  out.checks.switchRole = sw.getAttribute('role');
  out.checks.switchFocusable = sw.tabIndex === 0;
  sw.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
  out.checks.switchAfterSpace = sw.getAttribute('aria-checked');
  out.checks.switchCheckedBg = getComputedStyle(sw).backgroundColor === resolve('var(--sinty-accent-color)');
  sw.click();
  out.checks.switchAfterClick = sw.getAttribute('aria-checked');
  sw.setAttribute('disabled', '');
  sw.click();
  out.checks.switchDisabledIgnored = sw.getAttribute('aria-checked') === 'false';
  out.checks.switchChanges = changes;

  const form = $('form');
  let submitted = null;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitted = Object.fromEntries(new FormData(form));
  });
  shadow('suggested', 'button').click();
  out.checks.formData = submitted;
  $('suggested').setAttribute('disabled', '');
  out.checks.disabledButton = shadow('suggested', 'button').disabled;

  const row = $('row');
  let activated = 0;
  row.addEventListener('click', () => activated++);
  row.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  out.checks.rowActivated = activated;
  out.checks.rowRole = row.getAttribute('role');

  const icon = $('icon');
  out.checks.iconUrl = icon.style.getPropertyValue('--sinty-icon-url');
  out.checks.iconHidden = icon.getAttribute('aria-hidden');
  const bad = document.createElement('sinty-icon');
  bad.setAttribute('name', '../x');
  document.body.append(bad);
  out.checks.iconRejectsPaths = bad.style.getPropertyValue('--sinty-icon-url');
  const img = await fetch(window.SintyUI.iconBase + 'network-wireless-symbolic.svg');
  out.checks.iconServed = img.ok && (await img.text()).includes('<svg');

  const dialog = $('dialog');
  dialog.show();
  out.checks.dialogOpen = dialog.open;
  out.styles.dialog = style(shadow('dialog', 'dialog'), box);
  out.styles.dialogTitlebar = style(shadow('dialog', '.titlebar'), box);
  out.styles.dialogTitle = style(shadow('dialog', '.title'), box);
  out.styles.dialogButton = style(shadow('dialog-button', 'button'), box);
  out.checks.dialogLabelled = shadow('dialog', 'dialog').getAttribute('aria-labelledby') === 'title';
  dialog.close();
  out.checks.dialogClosed = !dialog.open && !dialog.hasAttribute('open');
  out.checks.actionsShown = !shadow('dialog', '.actions').hidden;
  out.checks.bareActionsHidden = shadow('bare', '.actions').hidden;

  out.styles.sideRow = style($('side'), box);
  out.styles.sideLabel = style($('label'), [...box, 'opacity', 'letter-spacing', 'text-transform']);
  out.styles.badge = style(shadow('side', '.badge'), box);
  out.styles.bubble = style(shadow('bubble', 'button'), box);
  out.styles.iconBubble = style(shadow('ibubble', 'button'), box);
  out.styles.seg = style($('seg'), box);
  out.styles.segButton = style($('seg').querySelector('button'), box);
  out.styles.statusIcon = getComputedStyle(shadow('status', 'sinty-icon')).getPropertyValue('--sinty-icon-size').trim();
  out.styles.statusTitle = style(shadow('status', 'h2'), box);
  out.styles.trough = style(shadow('progress', '.trough'), box);
  out.checks.sideRole = $('side').getAttribute('role');
  out.checks.sideLabel = $('side').getAttribute('aria-label');
  out.checks.sideCurrent = $('side').getAttribute('aria-current');
  out.checks.sideBadgeHidden = shadow('side2', '.badge').hidden;
  out.checks.segInitial = [...$('seg').querySelectorAll('button')].map((b) => b.getAttribute('aria-pressed'));
  let segChanged = 0;
  $('seg').addEventListener('change', () => segChanged++);
  $('seg').querySelector('button').click();
  out.checks.segAfterClick = [$('seg').value, segChanged, $('seg').querySelector('button').getAttribute('aria-pressed')];
  out.checks.bubbleHeights = [shadow('bubble', 'button').getBoundingClientRect().height, shadow('ibubble', 'button').getBoundingClientRect().height];
  out.checks.iconBubbleLabel = shadow('ibubble', 'button').getAttribute('aria-label');
  out.checks.bubbleText = shadow('bubble', 'button').textContent.trim();
  let typed = 0;
  $('entry').addEventListener('input', () => typed++);
  shadow('entry', 'input').dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  out.checks.entryInputs = typed;
  let searched = 0;
  $('search').addEventListener('input', () => searched++);
  const field = shadow('search', 'input');
  field.value = 'lisb';
  field.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  out.checks.search = [$('search').value, searched];
  out.checks.statusColorIcon = shadow('status', 'sinty-icon').hasAttribute('color');
  out.checks.progressFill = shadow('progress', '.fill').style.width;
  out.checks.avatar = shadow('avatar', 'span') ? shadow('avatar', 'span').textContent : $('avatar').shadowRoot.textContent.trim();
  const colorIcon = document.createElement('sinty-icon');
  colorIcon.setAttribute('name', 'folder');
  colorIcon.setAttribute('color', '');
  document.body.append(colorIcon);
  out.checks.colorIconPending = colorIcon.style.getPropertyValue('--sinty-icon-url');
  const plainIcon = document.createElement('sinty-icon');
  plainIcon.setAttribute('name', 'x-office-presentation');
  plainIcon.setAttribute('color', '');
  document.body.append(plainIcon);
  for (let i = 0; i < 50 && colorIcon.style.getPropertyValue('--sinty-icon-url') === 'none'; i++) await new Promise((r) => setTimeout(r, 20));
  for (let i = 0; i < 50 && plainIcon.style.getPropertyValue('--sinty-icon-url') === 'none'; i++) await new Promise((r) => setTimeout(r, 20));
  out.checks.colorIconUrl = colorIcon.style.getPropertyValue('--sinty-icon-url');
  out.checks.plainColorIconUrl = plainIcon.style.getPropertyValue('--sinty-icon-url');
  const tinted = await (await fetch(out.checks.colorIconUrl.slice(5, -2))).text();
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--sinty-accent-color').trim();
  out.checks.colorIconAccent = [accent, tinted.toLowerCase().includes('#0b98bd'), [...new Set(tinted.toLowerCase().match(/#[0-9a-f]{6}/g))]];
  const colorImg = await fetch(window.SintyUI.iconBase + 'color/folder.svg');
  out.checks.colorIconServed = colorImg.ok;

  let ran = 0;
  const menu = window.SintyUI.menu([
    { label: 'Open', icon: 'document-open-symbolic', accel: 'Enter', run: () => ran++ },
    null,
    { label: 'Disabled', disabled: true, run: () => ran += 10 },
    { label: 'Delete', destructive: true, run: () => ran += 100 },
  ]);
  menu.open(null, { x: 20, y: 20 });
  out.checks.menuOpen = menu.matches(':popover-open');
  out.styles.menu = style(menu, box);
  const items = menu.querySelectorAll('sinty-menu-item');
  out.styles.menuItem = style(items[0], box);
  out.checks.menuRoles = [menu.getAttribute('role'), items[0].getAttribute('role'), items[0].getAttribute('aria-label')];
  out.checks.menuSeparators = menu.querySelectorAll('hr, [role="separator"]').length;
  items[1].click();
  out.checks.menuDisabledIgnored = ran === 0;
  items[0].click();
  await new Promise((r) => setTimeout(r, 50));
  out.checks.menuRan = ran;
  out.checks.menuRemoved = !menu.isConnected;

  let acted = 0;
  const t = window.SintyUI.toast('Moved to the trash', { action: 'Undo', onaction: () => acted++, timeout: 0 });
  out.styles.toast = style(t, box);
  out.checks.toastSlot = [t.parentElement && t.parentElement.id, t.slot];
  t.shadowRoot.querySelector('button:not(.close)').click();
  await new Promise((r) => setTimeout(r, 50));
  out.checks.toastAction = acted;

  $('result').textContent = JSON.stringify(out);
})().catch((e) => {
  document.getElementById('result').textContent = JSON.stringify({ error: String(e && e.stack || e) });
});
