import re, sys, unittest
from pathlib import Path
ROOT = Path(__file__).resolve().parents[3]; SK = ROOT / 'plugin' / 'skills'
sys.path.insert(0, str(ROOT / 'plugin/kit/tools'))
from plan_check import SHOT_TYPES
TAKEN = {'make-2d-video', 'new-video', 'render-video', 'video-sound', 'video-styles'}

def front(p):
    m = re.match(r'---\n(.*?)\n---\n', p.read_text(), re.S); return dict(re.findall(r'^(\w+):\s*(.+)$', m.group(1), re.M)) if m else {}

class Skills(unittest.TestCase):
    def test_front_matter(self):
        files = list(SK.glob('*/SKILL.md')); self.assertEqual({f.parent.name for f in files}, {'make-video', 'story', 'voices', 'render', 'sound'})
        for f in files:
            fm = front(f); self.assertIn('name', fm, f); self.assertIn('description', fm, f)
            self.assertNotIn(fm['name'], TAKEN); self.assertIn('cinestick', fm['description'].lower(), f)
    def test_orchestrator(self):
        t = (SK / 'make-video/SKILL.md').read_text()
        for w in ['Hook', 'Setup', 'Doubter', 'Escalation', 'Turn', 'Reveal', 'Closing line', 'plan_check.py', 'voices.py', 'mix.py', 'Good to go, or what should change?']:
            self.assertIn(w, t, w)
    def test_references(self):
        R = SK / 'make-video/references'
        for f in ['install.md', 'story-short.md', 'story-long.md', 'directing.md', 'style-bible.md', 'cast-and-creatures.md', 'engine-api.md', 'voice.md', 'sound.md', 'render-qc.md']:
            self.assertTrue((R / f).is_file(), f)
        d = (R / 'directing.md').read_text()
        for t in SHOT_TYPES: self.assertIn(f'`{t}`', d, t)

if __name__ == '__main__': unittest.main()
