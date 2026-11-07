"""tools/doctor.py — check (and optionally install) everything cinestick needs. Run it with the studio venv: .venv/bin/python tools/doctor.py

  python tools/doctor.py            # report
  python tools/doctor.py --install  # also run the install commands that are safe to automate
"""
import importlib.util, json, os, platform, shutil, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OS = platform.system()  # Windows | Darwin | Linux
PY = sys.executable
rows, fixes = [], []


def ok(name, good, detail="", fix=None):
    rows.append((("OK " if good else "MISSING ") + name, detail))
    if not good and fix: fixes.append(fix)


def ver(cmd):
    try: return subprocess.run(cmd, capture_output=True, text=True, timeout=30).stdout.strip().splitlines()[0]
    except Exception: return None


ff = shutil.which("ffmpeg") and shutil.which("ffprobe")
ok("ffmpeg + ffprobe", bool(ff), ver(["ffmpeg", "-version"]) or "",
   {"Windows": "winget install --id Gyan.FFmpeg -e   (then open a NEW terminal)", "Darwin": "brew install ffmpeg"}.get(OS, "sudo apt-get install -y ffmpeg"))
nv = ver(["node", "--version"])
ok("Node.js >= 18", bool(nv) and int(nv.lstrip("v").split(".")[0]) >= 18, nv or "",
   {"Windows": "winget install OpenJS.NodeJS.LTS", "Darwin": "brew install node"}.get(OS, "install Node 20 LTS from https://nodejs.org or: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs"))
nm = all(os.path.isdir(os.path.join(ROOT, "node_modules", p)) for p in ["three", "playwright", "@fontsource/fredoka", "@fontsource/nunito", "@fontsource/playfair-display"])
ok("npm packages (three, playwright, fonts)", nm, "", f"cd \"{ROOT}\" && npm install")
chrom = False
if os.environ.get("PW_CHROMIUM"): chrom = os.path.exists(os.environ["PW_CHROMIUM"])
else:
    try:
        out = subprocess.run(["node", "-e", "import('playwright').then(p=>{console.log(p.chromium.executablePath())})"], cwd=ROOT, capture_output=True, text=True, timeout=60).stdout.strip()
        chrom = bool(out) and os.path.exists(out)
    except Exception:
        pass
ok("Chromium for Playwright" + (" (PW_CHROMIUM)" if os.environ.get("PW_CHROMIUM") else ""), chrom, "", f"cd \"{ROOT}\" && npx playwright install chromium   (or set PW_CHROMIUM to an existing Chromium)")
ok("python 3.11-3.13 (kokoro-onnx)", (3, 11) <= sys.version_info[:2] < (3, 14), sys.version.split()[0], "sh tools/setup.sh   (it creates .venv with Python 3.11-3.13)")
for mod, pipname in [("numpy", "numpy"), ("scipy", "scipy"), ("soundfile", "soundfile"), ("soxr", "soxr"), ("faster_whisper", "faster-whisper"), ("kokoro_onnx", "kokoro-onnx")]:
    ok(f"python: {pipname}", importlib.util.find_spec(mod) is not None, "", f"\"{PY}\" -m pip install {pipname}")
VOICE = os.path.join(ROOT, "tools", "voice")
ok("Kokoro voice model", all(os.path.exists(os.path.join(VOICE, f)) for f in ["kokoro-v1.0.onnx", "voices-v1.0.bin"]), "tools/voice/kokoro-v1.0.onnx + voices-v1.0.bin", "sh tools/setup.sh   (downloads the model, ~350 MB)")

print("\ncinestick — environment check\n")
for a, b in rows: print(f"  {a:45s} {b}")
gpu = "unknown"
try: gpu = "NVIDIA GPU found" if shutil.which("nvidia-smi") else "no NVIDIA GPU (CPU render / transcription — slower, works fine)"
except Exception: pass
print(f"\n  {OS} {platform.machine()}, {os.cpu_count()} CPU threads, {gpu}")
if fixes:
    print("\nTo fix, run:")
    for f in fixes: print("  " + f)
    if "--install" in sys.argv:
        for f in fixes:
            if f.startswith(("cd ", f"\"{PY}\"")):
                print(f"\n>>> {f}"); subprocess.run(f, shell=True, cwd=ROOT)
        print("\nRe-run: python tools/doctor.py")
else:
    print("\nAll good. Whisper downloads its base.en model (~145 MB) the first time voices are checked.")
sys.exit(1 if fixes else 0)
