"""Pick a Python that kokoro-onnx supports (3.11, 3.12 or 3.13). Prints its path, or exits 2 with how to get one.

  python3 tools/pick_python.py [candidate ...]
"""
import shutil, subprocess, sys

DEFAULTS = ['python3.13', 'python3.12', 'python3.11', 'python3']


def ok_version(v) -> bool:
    return (3, 11) <= tuple(v[:2]) < (3, 14)


def _version(exe):
    try:
        out = subprocess.run([exe, '-c', 'import sys; print(*sys.version_info[:2])'], capture_output=True, text=True, timeout=20).stdout.split()
        return tuple(int(x) for x in out[:2]) if len(out) >= 2 else None
    except (OSError, subprocess.SubprocessError):
        return None


def pick(candidates):
    for c in candidates:
        exe = shutil.which(c) or c
        v = _version(exe)
        if v and ok_version(v): return exe
    return None


if __name__ == '__main__':
    exe = pick(sys.argv[1:] or DEFAULTS)
    if exe: print(exe); sys.exit(0)
    print('cinestick needs Python 3.11, 3.12 or 3.13 (kokoro-onnx does not support 3.14 yet).\n'
          '  macOS:   brew install python@3.12\n  Ubuntu:  sudo apt install python3.12 python3.12-venv\n'
          '  Windows: winget install Python.Python.3.12', file=sys.stderr)
    sys.exit(2)
