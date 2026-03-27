#!/bin/bash
set -e

DMG_URL="https://github.com/kitkatattackk/GovWatch/releases/download/v1.0.0/GovWatch-1.0.0-arm64.dmg"
DMG_PATH="$TMPDIR/GovWatch.dmg"

echo "Downloading GovWatch..."
curl -L "$DMG_URL" -o "$DMG_PATH"

echo "Removing quarantine..."
xattr -cr "$DMG_PATH"

echo "Mounting DMG..."
MOUNT="/tmp/govwatch_mount"
mkdir -p "$MOUNT"
hdiutil attach "$DMG_PATH" -nobrowse -quiet -mountpoint "$MOUNT"

echo "Installing to /Applications..."
cp -R "$MOUNT/GovWatch.app" /Applications/
xattr -cr /Applications/GovWatch.app

echo "Cleaning up..."
hdiutil detach "$MOUNT" -quiet
rm "$DMG_PATH"

echo "Done! GovWatch is installed in /Applications."
