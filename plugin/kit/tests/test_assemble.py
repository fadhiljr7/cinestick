import json, sys, tempfile, unittest
from pathlib import Path
import numpy as np, soundfile as sf
KIT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(KIT / 'tools' / 'voice')); sys.path.insert(0, str(KIT / 'tools'))
import assemble as A

def tone(path, dur, sr=24000):
    t = np.arange(int(dur * sr)) / sr; sf.write(path, (0.3 * np.sin(2 * np.pi * 220 * t)).astype(np.float32), sr)

class Slug(unittest.TestCase):
    def test_slugify(self): self.assertEqual(A.slugify("What if you had 1000 IQ?"), "what-if-you-had-1000-iq")
    def test_out_name(self):
        self.assertEqual(A.out_name("What if you had 1000 IQ?"), "What_if_you_had_1000_IQ.mp4")
        self.assertEqual(A.out_name("Don't Stop"), "Dont_Stop.mp4")   # same rule as audio/mix.py

class Gaps(unittest.TestCase):
    def test_gaps(self):
        m = {'who': 'maya'}; c = {'who': 'cap'}
        self.assertAlmostEqual(A.gap_before(None, m), 0.05)
        self.assertAlmostEqual(A.gap_before(m, dict(m)), 0.14)
        self.assertAlmostEqual(A.gap_before(m, c), 0.22)
        self.assertAlmostEqual(A.gap_before(m, {'who': 'maya', 'beat': 'turn'}), 0.4)
        self.assertAlmostEqual(A.gap_before(m, {'who': 'cap', 'beat': 'reveal'}), 0.4)

class Assemble(unittest.TestCase):
    def setUp(self):
        self.d = Path(tempfile.mkdtemp()); v = self.d / 'voices'; v.mkdir()
        self.lines = [{'id': 'a', 'who': 'maya', 'vo': True, 'text': 'One two.'},
                      {'id': 'b', 'who': 'maya', 'vo': True, 'text': 'Three.'},
                      {'id': 'c', 'who': 'cap', 'vo': False, 'text': 'Four five.'}]
        for i, d in zip('abc', [1.0, 0.5, 0.8]): tone(v / f'{i}.wav', d)
        json.dump({'a': [['One', 0.0, 0.4], ['two.', 0.4, 0.9]], 'b': [['Three.', 0.0, 0.4]], 'c': [['Four', 0.0, 0.3], ['five.', 0.3, 0.7]]}, open(v / 'words.json', 'w'))

    def test_assemble_synthetic(self):
        r = A.assemble(self.d, self.lines, self.d / 'voices')
        L = json.load(open(self.d / 'timeline/lines.json'))
        for got, want in zip([l['t0'] for l in L], [0.05, 1.19, 1.91]): self.assertAlmostEqual(got, want, delta=0.001)
        W = json.load(open(self.d / 'timeline/words.json'))['words']
        self.assertTrue(all('line' in w for w in W)); self.assertEqual(len(W), 5)
        self.assertIn('"cap"', (self.d / 'scenes/dialogue.js').read_text())
        self.assertTrue((self.d / 'input/voiceover.wav').is_file()); self.assertEqual(r['lines'], 3)
        self.assertAlmostEqual(r['duration'], 1.91 + 0.8, delta=0.35)

    def test_token_mismatch_keeps_asr(self):
        ws = A.line_words({'text': "Don't-stop now"}, [["Don't", 0, .2], ["stop", .2, .4], ["now", .4, .6]], 0.0, 1.0)
        self.assertEqual([w['word'] for w in ws], ["Don't", "stop", "now"])

    def test_token_match_uses_script_spelling(self):
        ws = A.line_words({'text': "I have 1000 IQ."}, [["I", 0, .1], ["have", .1, .2], ["a", .2, .3], ["thousand", .3, .5], ["IQ", .5, .7]], 0.0, 1.0)
        self.assertEqual([w['word'] for w in ws], ["I", "have", "1000", "IQ."])
        self.assertEqual((ws[2]['start'], ws[2]['end']), (0.2, 0.5))   # "a thousand" merged into one caption word
        ws = A.line_words({'text': "Split! Split!"}, [["Split,", 0, .2], ["split.", .2, .4]], 0.0, 1.0)
        self.assertEqual([w['word'] for w in ws], ["Split!", "Split!"])

if __name__ == '__main__': unittest.main()
