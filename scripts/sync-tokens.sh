#!/bin/sh
set -eu
usage() {
	echo "usage: $0 LIBSINGULARITY_SOURCE LIBSINGULARITY_BUILD" >&2
	exit 2
}
[ $# -eq 2 ] || usage
src=$(cd "$1" && pwd)
build=$(cd "$2" && pwd)
root=$(cd "$(dirname "$0")/.." && pwd)
tool=$(find "$build" -name singularity-web-tokens -type f -perm -u+x | head -n 1)
[ -n "$tool" ] || { echo "build singularity-web-tokens in $build first" >&2; exit 1; }
"$tool" > "$root/tokens/sintyui-tokens.css.new"
mv "$root/tokens/sintyui-tokens.css.new" "$root/tokens/sintyui-tokens.css"
commit=$(git -C "$src" rev-parse HEAD)
tmp=$(mktemp "$root/tokens/source.XXXXXX")
sed "s/\"libsingularity\": \"[0-9a-f]*\"/\"libsingularity\": \"$commit\"/" "$root/tokens/source.json" > "$tmp"
mv "$tmp" "$root/tokens/source.json"
echo "tokens from libsingularity $commit"
