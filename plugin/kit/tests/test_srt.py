import sys, unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'tools'))
import srt

W = [{'word': 'Wait,', 'start': 1.0, 'end': 1.3, 'line': 'd1'}, {'word': 'how?', 'start': 1.4, 'end': 1.8, 'line': 'd1'},
     {'word': 'Just', 'start': 2.2, 'end': 2.4, 'line': 'd2'}, {'word': 'watch.', 'start': 2.4, 'end': 2.9, 'line': 'd2'}]

class Srt(unittest.TestCase):
    def test_groups_by_speaker(self): self.assertEqual(srt.groups(W), [[0, 1], [2, 3]])
    def test_srt_text(self):
        self.assertEqual(srt.to_srt(W), "1\n00:00:01,000 --> 00:00:01,800\nWait, how?\n\n2\n00:00:02,200 --> 00:00:02,900\nJust watch.\n")
    def test_timestamp(self): self.assertEqual(srt.ts(3725.5), "01:02:05,500")

if __name__ == '__main__': unittest.main()
