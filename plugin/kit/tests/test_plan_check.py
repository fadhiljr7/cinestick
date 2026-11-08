import sys, unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'tools'))
import plan_check as PC

def shots(durs, types=None, ins=None, chapters=None):
    t, out = 0.0, []
    for i, d in enumerate(durs):
        out.append({'id': f's{i:02d}', 'start': round(t, 3), 'end': round(t + d, 3), 'type': (types or ['two-shot', 'bigface', 'insert'] * 99)[i],
                    'in': {'type': (ins or ['fade'] * 99)[i], 'dur': 0.2}})
        if chapters: out[-1]['chapter'] = chapters[i]
        t += d
    out[-1]['type'] = (types or [None] * 99)[len(durs) - 1] or 'callback'
    return {'duration': t, 'shots': out}

SHORT, LONG = {'length': 'short'}, {'length': 'long'}

def long_shots(n, per=3.0):
    """n shots of `per` s in 5 chapters; each chapter opens with a dip into an establishing shot."""
    chs = [f'c{i * 5 // n}' for i in range(n)]
    types = ['establishing' if i == 0 or chs[i] != chs[i - 1] else ['two-shot', 'bigface', 'insert'][i % 3] for i in range(n)]
    ins = ['dip' if i and chs[i] != chs[i - 1] else 'fade' for i in range(n)]
    return shots([per] * n, types=types, ins=ins, chapters=chs)
has = lambda errs, word: any(word in e for e in errs)

class Rules(unittest.TestCase):
    def test_clean_short(self): self.assertEqual(PC.check(shots([1.5] * 40), SHORT), [])
    def test_short_minimum_60s(self):
        self.assertTrue(has(PC.check(shots([1.5] * 39), SHORT), 'duration'))      # 58.5 s
        self.assertFalse(has(PC.check(shots([1.5] * 40), SHORT), 'duration'))     # 60 s
    def test_long_minimum_8min_recommended_10(self):
        self.assertTrue(has(PC.check(long_shots(158), LONG), 'duration'))          # 474 s < 8 min
        ok = long_shots(170)                                                       # 510 s
        self.assertEqual(PC.check(ok, LONG), [])
        self.assertTrue(any('10' in n for n in PC.notes(ok, LONG)))
        self.assertEqual(PC.notes(long_shots(204), LONG), [])                      # 612 s ≥ 10 min
    def test_gap(self):
        s = shots([1.5] * 6); s['shots'][2]['start'] += 0.1
        self.assertTrue(has(PC.check(s, SHORT), 'gap'))
    def test_median(self): self.assertTrue(has(PC.check(shots([2.4] * 8), SHORT), 'median'))
    def test_too_long_but_final_ok(self):
        self.assertTrue(has(PC.check(shots([1.5, 3.8] + [1.5] * 6), SHORT), 'too long'))
        self.assertFalse(has(PC.check(shots([1.5] * 7 + [4.0]), SHORT), 'too long'))
    def test_repeat(self):
        self.assertTrue(has(PC.check(shots([1.5] * 6, types=['bigface', 'bigface', 'bigface', 'insert', 'two-shot', 'callback']), SHORT), 'repeat'))
    def test_freeze(self):
        self.assertTrue(has(PC.check(shots([1.5] * 6, types=['freeze', 'insert', 'freeze', 'two-shot', 'freeze', 'callback']), SHORT), 'freeze'))
    def test_callback(self):
        self.assertTrue(has(PC.check(shots([1.5] * 6, types=['two-shot', 'insert', 'bigface', 'two-shot', 'insert', 'bigface']), SHORT), 'callback'))
    def test_dissolve(self):
        self.assertTrue(has(PC.check(shots([1.5] * 10, ins=['cut'] * 5 + ['fade'] * 5), SHORT), 'dissolve'))
    def test_long_clean(self): self.assertEqual(PC.check(long_shots(170), LONG), [])
    def test_unknown_type(self):
        self.assertTrue(has(PC.check(shots([1.5] * 6, types=['two-shot', 'wobble', 'insert', 'bigface', 'two-shot', 'callback']), SHORT), 'type'))

if __name__ == '__main__': unittest.main()
