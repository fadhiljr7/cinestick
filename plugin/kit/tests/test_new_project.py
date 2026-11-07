import json, sys, tempfile, unittest
from pathlib import Path
KIT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(KIT / 'tools'))
import new_project as NP

class NewProject(unittest.TestCase):
    def setUp(self): self.root = Path(tempfile.mkdtemp())
    def test_vertical_short_defaults(self):
        p = NP.create_project(self.root, 'What if you had 1000 IQ?', aspect='9:16', length='short')
        self.assertEqual(p, self.root / 'projects' / 'what-if-you-had-1000-iq')
        c = json.load(open(p / 'config.json'))
        self.assertEqual((c['captions'], c['bars'], c['fps'], c['style'], c['length'], c['aspect']), (True, None, 24, 'dusk', 'short', '9:16'))
        self.assertEqual(c['voiceover'], 'input/voiceover.wav'); self.assertEqual(c['title'], 'What if you had 1000 IQ?')
        for f in ['cast-kit.js', 'captions.js', 'grouping.js', 'creature.js']: self.assertTrue((p / 'scenes/lib' / f).is_file(), f)
    def test_landscape_defaults(self):
        c = json.load(open(NP.create_project(self.root, 'Long One', aspect='16:9', length='long') / 'config.json'))
        self.assertEqual((c['captions'], c['bars'], c['length']), (False, 'wide', 'long'))
    def test_existing_project_kept(self):
        p = NP.create_project(self.root, 'Same'); (p / 'story/keep.txt').write_text('x')
        NP.create_project(self.root, 'Same'); self.assertTrue((p / 'story/keep.txt').exists())

if __name__ == '__main__': unittest.main()
