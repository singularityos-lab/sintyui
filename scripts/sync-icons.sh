#!/bin/sh
set -eu
[ $# -eq 1 ] || { echo "usage: $0 SINGULARITY_THEMES_SOURCE" >&2; exit 2; }
themes=$(cd "$1" && pwd)
root=$(cd "$(dirname "$0")/.." && pwd)
missing=0
copy() {
	while read -r name; do
		[ -n "$name" ] || continue
		found=$(find "$themes/Singularity/scalable" -name "$name.svg" | head -n 1)
		if [ -z "$found" ]; then
			echo "missing: $name" >&2
			missing=1
			continue
		fi
		cp "$found" "$2/$name.svg"
	done < "$1"
}
copy "$root/icons/icons.txt" "$root/icons"
copy "$root/icons/color/icons.txt" "$root/icons/color"
[ "$missing" -eq 0 ] || exit 1
python3 - "$themes/tools/accent-icons.py" "$root/icons/color/accent-template.json" <<'PY'
import importlib.util, json, sys
spec = importlib.util.spec_from_file_location("accent_icons", sys.argv[1])
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
data = {"template": mod.TEMPLATE, "hue_follow": mod.HUE_FOLLOW, "min_chroma_ratio": mod.MIN_CHROMA_RATIO, "neutral_chroma": mod.NEUTRAL_CHROMA}
with open(sys.argv[2], "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)
    f.write("\n")
PY
commit=$(git -C "$themes" rev-parse HEAD)
tmp=$(mktemp "$root/tokens/source.XXXXXX")
sed "s/\"singularity-themes\": \"[0-9a-f]*\"/\"singularity-themes\": \"$commit\"/" "$root/tokens/source.json" > "$tmp"
mv "$tmp" "$root/tokens/source.json"
echo "icons from singularity-themes $commit"
