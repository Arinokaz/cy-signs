#!/bin/bash
set -e

# Run from repo root regardless of where invoked
cd "$(dirname "$0")/.."

# Read version, strip all whitespace
VERSION=$(tr -d '[:space:]' < VERSION)

if [ -z "$VERSION" ]; then
    echo "ERROR: VERSION file is empty"
    exit 1
fi

if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+(\.[0-9]+)?$ ]]; then
    echo "ERROR: VERSION '$VERSION' is not in expected format (e.g., 5.6 or 5.6.1)"
    exit 1
fi

echo "Bumping to v$VERSION..."

# 1. sw.js: replace CACHE_NAME
sed -i -E "s/cyprus-signs-dynamic-v[0-9]+(\.[0-9]+)*/cyprus-signs-dynamic-v$VERSION/g" sw.js
SW_COUNT=$(grep -c "cyprus-signs-dynamic-v$VERSION" sw.js)
echo "  sw.js: $SW_COUNT match(es) for v$VERSION"

# 2. *.html (root) and signs/*.html: replace ?v=X.Y
sed -i -E "s/\?v=[0-9]+(\.[0-9]+)*/?v=$VERSION/g" *.html signs/*.html
HTML_COUNT=$(grep -rE "\?v=$VERSION" --include="*.html" . | wc -l)
echo "  *.html (root + signs/): $HTML_COUNT match(es) for v$VERSION"

echo ""
echo "Done. Review with: git diff"
