import json, sys, tempfile, unittest
from pathlib import Path
import numpy as np, soundfile as sf
KIT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(KIT / 'tools' / 'voice')); sys.path.insert(0, str(KIT / 'tools'))
import voices as VV

def project(lines):
    d = Path(tempfile.mkdtemp()); (d / 'input').mkdir(); json.dump(lines, open(d / 'input/lines.json', 'w')); return d

class Recorder:
    def __init__(self, ok=True): self.calls = []; self.ok = ok
    def synth(self, line, speed, out):
        self.calls.append((line['id'], round(speed, 3)))
        sf.write(str(out), np.zeros(2400, np.float32), 24000)
    def check(self, line, wav): return self.ok, [[line['text'].split()[0], 0.0, 0.1]]

L = [{'id': 'a', 'who': 'maya', 'voice': 'af_heart', 'speed': 1.0, 'text': 'Hello there.'},
     {'id': 'b', 'who': 'cap', 'voice': 'am_puck', 'speed': 1.05, 'text': 'Hi.', 'treat': 'side'}]

class Pure(unittest.TestCase):
    def test_treatment_keys(self): self.assertEqual(set(VV.TREATMENTS), {'normal', 'side', 'creature', 'villain'})
    def test_line_hash_changes_with_text(self):
        a = dict(L[0]); b = dict(a, text='Other words.'); c = dict(a, who='cap')
        self.assertNotEqual(VV.line_hash(a), VV.line_hash(b)); self.assertEqual(VV.line_hash(a), VV.line_hash(c))
    def test_expand_abbrev(self):
        self.assertEqual(VV.expand_abbrev('Then, Dr. Lee and Mr. Smith met Mrs. Jones on St. Mark'), 'Then, Doctor Lee and Mister Smith met Missus Jones on Saint Mark')
    def test_number_asr(self):
        self.assertEqual(VV.number_asr('I have 1000 IQ'), 'I have a thousand IQ')
        self.assertIsNone(VV.number_asr('no digits'))

class Build(unittest.TestCase):
    def test_cache_skips_unchanged(self):
        d = project(L); r = Recorder()
        first = VV.build_voices(d, synth=r.synth, check=r.check); self.assertEqual(sorted(first['ok']), ['a', 'b'])
        r.calls.clear(); second = VV.build_voices(d, synth=r.synth, check=r.check)
        self.assertEqual(sorted(second['cached']), ['a', 'b']); self.assertEqual(r.calls, [])
        lines = json.load(open(d / 'input/lines.json')); lines[1]['text'] = 'Hey you.'; json.dump(lines, open(d / 'input/lines.json', 'w'))
        third = VV.build_voices(d, synth=r.synth, check=r.check)
        self.assertEqual([c[0] for c in r.calls], ['b']); self.assertEqual(third['cached'], ['a'])
        self.assertEqual(set(json.load(open(d / 'voices/words.json'))), {'a', 'b'})

    def test_retry_then_flag(self):
        d = project(L[:1]); r = Recorder(ok=False)
        res = VV.build_voices(d, synth=r.synth, check=r.check)
        self.assertEqual(r.calls, [('a', 1.0), ('a', 0.95), ('a', 0.9)]); self.assertEqual(res['flagged'], ['a'])

if __name__ == '__main__': unittest.main()
