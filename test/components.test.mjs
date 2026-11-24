import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, normalize, resolve, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const libsingularity = resolve(process.env.LIBSINGULARITY || join(root, '..', 'libsingularity'));

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' };

function serve() {
  const server = createServer(async (req, res) => {
    const path = normalize(join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname)));
    if (!path.startsWith(root + '/')) {
      res.writeHead(403).end();
      return;
    }
    try {
      const body = await readFile(path);
      res.writeHead(200, { 'content-type': types[extname(path)] || 'application/octet-stream' }).end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server)));
}

async function chrome() {
  if (process.env.CHROME) return process.env.CHROME;
  const cache = join(homedir(), '.cache', 'ms-playwright');
  if (existsSync(cache)) {
    for (const dir of (await readdir(cache)).filter((d) => d.startsWith('chromium_headless_shell-')).sort().reverse()) {
      const bin = join(cache, dir, 'chrome-headless-shell-linux64', 'chrome-headless-shell');
      if (existsSync(bin)) return bin;
    }
  }
  for (const name of ['chromium', 'chromium-browser', 'google-chrome']) {
    for (const dir of (process.env.PATH || '').split(':')) {
      if (existsSync(join(dir, name))) return join(dir, name);
    }
  }
  throw new Error('no Chromium found: set CHROME');
}

function dump(bin, url) {
  return new Promise((ok, fail) => {
    execFile(bin, ['--headless', '--no-sandbox', '--disable-gpu', '--virtual-time-budget=5000', '--dump-dom', url],
      { maxBuffer: 1 << 24, timeout: 60000 }, (err, stdout) => (err ? fail(err) : ok(stdout)));
  });
}

function rules(css) {
  const out = [];
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(clean))) {
    const selectors = m[1].split(',').map((s) => s.trim().replace(/\s+/g, ' '));
    const decls = {};
    for (const d of m[2].split(';')) {
      const i = d.indexOf(':');
      if (i > 0) decls[d.slice(0, i).trim()] = d.slice(i + 1).trim();
    }
    out.push({ selectors, decls });
  }
  return out;
}

function rule(list, selector) {
  const found = list.find((r) => r.selectors.includes(selector));
  assert.ok(found, `libsingularity has no rule for ${selector}`);
  return found.decls;
}

function sides(value) {
  const p = value.split(/\s+/);
  const [t, r = t, b = t, l = r] = p;
  return { 'padding-top': t, 'padding-right': r, 'padding-bottom': b, 'padding-left': l };
}

function rgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
}

function token(css, selector, name) {
  const at = css.indexOf(selector + ' {');
  assert.ok(at >= 0, selector);
  const block = css.slice(at, css.indexOf('}', at));
  const m = block.match(new RegExp(`${name}: ([^;]+);`));
  assert.ok(m, `${name} in ${selector}`);
  return m[1];
}

test('components match libsingularity and behave', async (t) => {
  const css = rules((await readFile(join(libsingularity, 'src/style/style.css'), 'utf8'))
    + (await readFile(join(libsingularity, 'src/style/button-defaults.css'), 'utf8')));
  const light = await readFile(join(libsingularity, 'src/style/style.light.css'), 'utf8');
  const dark = await readFile(join(libsingularity, 'src/style/style.dark.css'), 'utf8');
  const tokens = await readFile(join(root, 'tokens/sintyui-tokens.css'), 'utf8');
  const server = await serve();
  let html;
  try {
    html = await dump(await chrome(), `http://127.0.0.1:${server.address().port}/test/page.html`);
  } finally {
    server.close();
  }
  const raw = html.match(/<pre id="result">([\s\S]*?)<\/pre>/)[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  const { styles: s, checks: c, error } = JSON.parse(raw);
  assert.equal(error, undefined, error);

  await t.test('geometry follows the toolkit', () => {
    const button = rule(css, 'button');
    assert.equal(s.button['border-top-left-radius'], button['border-radius']);
    assert.deepEqual(Object.fromEntries(Object.keys(sides('0')).map((k) => [k, s.button[k]])), sides(button.padding));
    const pill = rule(css, 'button.pill');
    assert.deepEqual(Object.fromEntries(Object.keys(sides('0')).map((k) => [k, s.pill[k]])), sides(pill.padding));
    assert.equal(s.pill['font-weight'], pill['font-weight']);
    const inDialog = rule(css, '.dialog-card button.pill');
    assert.deepEqual(Object.fromEntries(Object.keys(sides('0')).map((k) => [k, s.dialogButton[k]])), sides(inDialog.padding));
    assert.equal(s.dialogButton['min-height'], inDialog['min-height']);
    const sw = rule(css, 'switch');
    assert.equal(s.switch['min-width'], sw['min-width']);
    assert.equal(s.switch['min-height'], sw['min-height']);
    assert.equal(s.switch['border-top-left-radius'], sw['border-radius']);
    const entry = rule(css, 'entry');
    assert.equal(s.entry['border-top-left-radius'], entry['border-radius']);
    assert.equal(s.entry['min-height'], entry['min-height']);
    assert.deepEqual(Object.fromEntries(Object.keys(sides('0')).map((k) => [k, s.entry[k]])), sides(entry.padding));
    assert.equal(s.group['border-top-left-radius'], rule(css, '.singularity .preferences-group')['border-radius']);
    assert.deepEqual(Object.fromEntries(Object.keys(sides('0')).map((k) => [k, s.groupHeader[k]])), sides(rule(css, '.singularity .preferences-group .group-header').padding));
    const heading = rule(css, '.singularity .preferences-group .heading');
    assert.equal(s.groupHeading['font-size'], heading['font-size']);
    assert.equal(s.groupHeading['font-weight'], heading['font-weight']);
    assert.equal(s.row['min-height'], rule(css, '.singularity .preferences-row')['min-height']);
    const title = rule(css, '.singularity .preferences-row .title');
    assert.equal(s.rowTitle['font-size'], title['font-size']);
    assert.equal(s.rowTitle['font-weight'], title['font-weight']);
    assert.equal(s.rowSubtitle['font-size'], rule(css, '.singularity .preferences-row .subtitle')['font-size']);
    assert.equal(s.rowBorder, '1px');
    assert.equal(s.lastRowBorder, '0px');
    assert.equal(s.dialog['border-top-left-radius'], rule(css, '.dialog-card')['border-radius']);
    const bar = rule(css, '.dialog-titlebar');
    assert.deepEqual(Object.fromEntries(Object.keys(sides('0')).map((k) => [k, s.dialogTitlebar[k]])), sides(bar.padding));
    assert.equal(s.dialogTitlebar['min-height'], bar['min-height']);
    const dtitle = rule(css, '.dialog-titlebar .title');
    assert.equal(s.dialogTitle['font-size'], dtitle['font-size']);
    assert.equal(s.dialogTitle['font-weight'], dtitle['font-weight']);
  });

  await t.test('colours come from the generated tokens', () => {
    assert.equal(c.lightText, rgb(light.match(/@define-color text_color (#[0-9a-f]{6});/)[1]));
    assert.equal(c.darkText, rgb(dark.match(/@define-color text_color (#[0-9a-f]{6});/)[1]));
    assert.ok(c.suggestedIsAccent);
    assert.equal(s.destructive.color, rgb(light.match(/@define-color destructive_fg (#[0-9a-f]{6});/)[1]));
    assert.equal(rule(css, 'button.destructive-action').color, '@destructive_fg');
    const lum = (c) => {
      const [r, g, b] = c.match(/\d+/g).slice(0, 3).map((v) => {
        const x = v / 255;
        return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const [hi, lo] = [lum(s.destructive.color), lum(s.destructive['background-color'])].sort((a, b) => b - a);
    assert.ok((hi + 0.05) / (lo + 0.05) >= 4.5, 'destructive button text contrast');
    assert.equal(c.tealAccent, rgb(token(tokens, ':root[data-sinty-accent="teal"]', '--sinty-accent-color')));
    assert.equal(c.darkTealAccent, rgb(token(tokens, ':root[data-sinty-theme="dark"][data-sinty-accent="teal"]', '--sinty-accent-color')));
  });

  await t.test('controls behave like the desktop ones', () => {
    assert.equal(c.switchRole, 'switch');
    assert.ok(c.switchFocusable);
    assert.equal(c.switchAfterSpace, 'true');
    assert.ok(c.switchCheckedBg);
    assert.equal(c.switchAfterClick, 'false');
    assert.ok(c.switchDisabledIgnored);
    assert.equal(c.switchChanges, 2);
    assert.deepEqual(c.formData, { host: 'pc1' });
    assert.ok(c.disabledButton);
    assert.equal(c.rowActivated, 1);
    assert.equal(c.rowRole, 'listitem');
    assert.match(c.iconUrl, /icons\/network-wireless-symbolic\.svg/);
    assert.equal(c.iconHidden, 'true');
    assert.equal(c.iconRejectsPaths, 'none');
    assert.ok(c.iconServed);
    assert.ok(c.dialogOpen);
    assert.ok(c.dialogLabelled);
    assert.ok(c.dialogClosed);
    assert.ok(c.actionsShown);
    assert.ok(c.bareActionsHidden);
  });
});
