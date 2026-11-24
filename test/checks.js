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

  $('result').textContent = JSON.stringify(out);
})().catch((e) => {
  document.getElementById('result').textContent = JSON.stringify({ error: String(e && e.stack || e) });
});
