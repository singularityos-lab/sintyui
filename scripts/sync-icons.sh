#!/bin/sh
set -eu
[ $# -eq 1 ] || { echo "usage: $0 SINGULARITY_THEMES_SOURCE" >&2; exit 2; }
themes=$(cd "$1" && pwd)
root=$(cd "$(dirname "$0")/.." && pwd)
missing=0
while read -r name; do
	[ -n "$name" ] || continue
	found=$(find "$themes/Singularity/scalable" -name "$name.svg" | head -n 1)
	if [ -z "$found" ]; then
		echo "missing: $name" >&2
		missing=1
		continue
	fi
	cp "$found" "$root/icons/$name.svg"
done < "$root/icons/icons.txt"
[ "$missing" -eq 0 ] || exit 1
commit=$(git -C "$themes" rev-parse HEAD)
tmp=$(mktemp "$root/tokens/source.XXXXXX")
sed "s/\"singularity-themes\": \"[0-9a-f]*\"/\"singularity-themes\": \"$commit\"/" "$root/tokens/source.json" > "$tmp"
mv "$tmp" "$root/tokens/source.json"
echo "icons from singularity-themes $commit"
