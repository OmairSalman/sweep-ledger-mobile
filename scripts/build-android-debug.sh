#!/bin/bash
set -e

# Create output dir grouped by day
DATE=$(date -u +%Y-%m-%d)
TIME=$(date -u +%I-%M%p)
OUTDIR="./android-builds/debug/${DATE}"
mkdir -p "$OUTDIR"

# Compute build number for today
N=1
while ls "$OUTDIR/glyph-ledger_debug_${DATE}_build-${N}_"*"_UTC.apk" 2>/dev/null | grep -q .; do
  N=$((N + 1))
done

echo "Building android debug version ${DATE}_build-${N}_${TIME}_UTC..."
ionic build
if [ ! -f "./android/gradlew" ]; then
  echo "android/gradlew not found, adding the android platform..."
  ionic capacitor add android
fi
ionic capacitor sync android
cd android && ./gradlew assembleDebug && cd ..

DEST="$OUTDIR/glyph-ledger_debug_${DATE}_build-${N}_${TIME}_UTC.apk"
cp ./android/app/build/outputs/apk/debug/app-debug.apk "$DEST"

echo "APK saved to $DEST"