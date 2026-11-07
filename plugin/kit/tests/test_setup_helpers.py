import sys, unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'tools'))
import pick_python as PP, render_long as RL

class PickPython(unittest.TestCase):
    def test_ok_version(self):
        self.assertFalse(PP.ok_version((3, 14))); self.assertTrue(PP.ok_version((3, 12))); self.assertTrue(PP.ok_version((3, 11)))
        self.assertFalse(PP.ok_version((3, 10)))
    def test_pick_skips_missing(self):
        want = sys.executable if PP.ok_version(sys.version_info[:2]) else None
        self.assertEqual(PP.pick(['/nope/python3.12', sys.executable]), want)
    def test_pick_none(self): self.assertIsNone(PP.pick(['/nope/a', '/nope/b']))

class Chapters(unittest.TestCase):
    def test_chapter_ranges(self):
        s = {'duration': 9.0, 'shots': [{'start': 0, 'end': 3, 'chapter': 'c1'}, {'start': 3, 'end': 5, 'chapter': 'c1'}, {'start': 5, 'end': 9, 'chapter': 'c2'}]}
        self.assertEqual(RL.chapter_ranges(s), [('c1', 0, 5), ('c2', 5, 9)])
    def test_no_chapters(self):
        s = {'duration': 4.0, 'shots': [{'start': 0, 'end': 2}, {'start': 2, 'end': 4}]}
        self.assertEqual(RL.chapter_ranges(s), [('all', 0, 4.0)])

if __name__ == '__main__': unittest.main()
