# sintyui

Web components that look and behave like the Singularity desktop toolkit, for
web pages and web apps that sit next to native Singularity apps.

Colours, accents, light and dark mode and motion come from
`tokens/sintyui-tokens.css`, which is generated from libsingularity's own
stylesheets, never written by hand. Geometry (radii, padding, minimum sizes,
type) follows the rules in libsingularity's `style.css`, and the test suite
checks it against that file.

## Use

```html
<link rel="stylesheet" href="sintyui/src/sintyui.css">
<script src="sintyui/src/sintyui.js"></script>

<body class="sinty-surface">
  <sinty-group heading="Network">
    <sinty-row heading="Wi-Fi" subtitle="Connected to Home">
      <sinty-icon slot="prefix" name="network-wireless-symbolic"></sinty-icon>
      <sinty-switch checked></sinty-switch>
    </sinty-row>
  </sinty-group>
  <sinty-button variant="suggested" pill>Join</sinty-button>
</body>
```

Icons are loaded from `icons/` next to `src/`; set `SintyUI.iconBase` to serve
them from elsewhere.

| Element | Attributes | Notes |
| --- | --- | --- |
| `sinty-button` | `variant` (`suggested`, `destructive`, `flat`), `pill`, `disabled`, `type="submit"` | Form-associated |
| `sinty-switch` | `checked`, `disabled` | `role="switch"`, Space and Enter toggle, fires `change` |
| `sinty-group` | `heading`, `description` | Card holding rows |
| `sinty-row` | `heading`, `subtitle`, `activatable` | `prefix` slot for an icon, default slot for the control |
| `sinty-entry` | `value`, `placeholder`, `type`, `name`, `label`, `disabled`, `error` | Form-associated |
| `sinty-dialog` | `heading` | `show()`, `close()`, `actions` slot for buttons |
| `sinty-icon` | `name`, `size`, `label` | Symbolic icon tinted with `currentColor` |

## Theme and accent

The tokens follow `prefers-color-scheme`. To force a mode or pick an accent,
set attributes on the root element:

```html
<html data-sinty-theme="dark" data-sinty-accent="teal">
```

Accents: the same names the desktop offers in Settings.

## Updating from the desktop

```sh
scripts/sync-tokens.sh ../libsingularity ../libsingularity/build
scripts/sync-icons.sh ../singularity-themes
```

`sync-tokens.sh` runs `singularity-web-tokens` from a libsingularity build.
`sync-icons.sh` copies the icons listed in `icons/icons.txt` from the
Singularity icon theme. Both record the source commit in `tokens/source.json`.

## Tests

```sh
LIBSINGULARITY=../libsingularity npm test
```

The test serves the repository, opens `test/page.html` in headless Chromium
(set `CHROME` if it is not found), and compares computed styles with the rules
in libsingularity's stylesheets and the generated tokens.

## Licence

LGPL-2.1-or-later, like libsingularity.
