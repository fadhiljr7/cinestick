#!/bin/sh
# cinestick setup — run from the studio folder (the copy of plugin/kit in your workspace, e.g. ./cinestick-studio):
#   sh tools/setup.sh              everything: checks, Python venv, npm, Chromium, Kokoro model, doctor, self-test
#   sh tools/setup.sh --no-models  skip the ~350 MB voice-model download
# Needs: Node >= 18, ffmpeg, and Python 3.11-3.13 (kokoro-onnx does not support 3.14 yet). macOS or Linux; on Windows use WSL.
# Slow Chromium download? Point PW_CHROMIUM at an existing Chromium / chrome-headless-shell and re-run.
set -e
cd "$(dirname "$0")/.."
ROOT=$(pwd)
say() { printf '\n== %s\n' "$*"; }

say "system tools"
command -v node >/dev/null || { echo "Node.js is missing (>= 18): brew install node | https://nodejs.org"; exit 1; }
NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]')
[ "$NODE_MAJOR" -ge 18 ] || { echo "Node $NODE_MAJOR is too old: need >= 18"; exit 1; }
command -v ffmpeg >/dev/null && command -v ffprobe >/dev/null || { echo "ffmpeg is missing: brew install ffmpeg | sudo apt install ffmpeg | winget install Gyan.FFmpeg"; exit 1; }
echo "node $(node -v), $(ffmpeg -version | head -1 | cut -d' ' -f1-3)"

say "Python 3.11-3.13 venv (.venv)"
if [ ! -x .venv/bin/python ]; then
  PY=$(python3 tools/pick_python.py) || exit 2
  echo "using $PY"
  "$PY" -m venv .venv
fi
.venv/bin/python -m pip install -q --upgrade pip
.venv/bin/python -m pip install -q numpy scipy soundfile soxr faster-whisper "av<19" kokoro-onnx

say "JavaScript packages"
npm install --silent
if [ -n "$PW_CHROMIUM" ]; then echo "using PW_CHROMIUM=$PW_CHROMIUM"
elif [ "$(uname -s)" = "Linux" ]; then npx playwright install --with-deps chromium   # also the system libraries headless Chromium needs
else npx playwright install chromium; fi

if [ "$1" != "--no-models" ]; then
  say "Kokoro voice model (~350 MB, once)"
  BASE=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0
  for f in kokoro-v1.0.onnx voices-v1.0.bin; do
    [ -s "tools/voice/$f" ] || curl -L --fail -o "tools/voice/$f" "$BASE/$f"
  done
fi

say "doctor"
.venv/bin/python tools/doctor.py || { echo "fix the MISSING items above, then re-run: sh tools/setup.sh"; exit 1; }

say "self-test (contact sheet of the example film)"
node render.mjs --project examples/medicine --sheet --scale 0.3
printf "\nReady. Open examples/medicine/build/sheets/sheet_01.png to see the look. Studio: %s\n" "$ROOT"
