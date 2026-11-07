import sys, unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'tools'))
import publish as PB

def shots(spec, chapters=None):
    t, out = 0.0, []
    for d, ch in spec: out.append({'id': f's{len(out)}', 'start': t, 'end': t + d, **({'chapter': ch} if ch else {})}); t += d
    return {'duration': t, 'shots': out, **({'chapters': chapters} if chapters else {})}

LONG = shots([(20, 'open'), (40, 'c1'), (30, 'c1'), (60, 'c2'), (45, 'c3')],
             [{'id': 'open', 'title': 'Introduction'}, {'id': 'c1', 'title': 'Waking up a genius'}, {'id': 'c2', 'title': 'What IQ measures'}, {'id': 'c3', 'title': 'Conclusion'}])
GOOD_TAGS = ['1000 iq', 'what if', 'iq test', 'genius', 'intelligence', 'brain facts', 'animated short', 'science explained']
def meta(desc, tags=GOOD_TAGS, titles=None):
    return {'titles': titles or [{'text': 'What If You Had a 1000 IQ?', 'best': True}, {'text': 'Waking Up With 1000 IQ', 'best': False}, {'text': 'Why No Test Could Measure You', 'best': False}],
            'description': desc, 'tags': tags}

class Timestamps(unittest.TestCase):
    def test_fmt_ts(self):
        self.assertEqual(PB.fmt_ts(0), '00:00'); self.assertEqual(PB.fmt_ts(85.4), '01:25'); self.assertEqual(PB.fmt_ts(3725), '1:02:05')
    def test_chapter_list_from_real_shots(self):
        self.assertEqual(PB.chapter_list(LONG), [(0.0, 'Introduction'), (20.0, 'Waking up a genius'), (90.0, 'What IQ measures'), (150.0, 'Conclusion')])
    def test_chapters_rules(self):
        self.assertEqual(PB.validate_chapters(PB.chapter_list(LONG)), [])
        self.assertTrue(any('3' in e for e in PB.validate_chapters([(0, 'a'), (30, 'b')])))
        self.assertTrue(any('10' in e for e in PB.validate_chapters([(0, 'a'), (5, 'b'), (40, 'c')])))

class Validate(unittest.TestCase):
    def test_short_ok(self):
        self.assertEqual(PB.validate(meta('Wake up with a 1000 IQ. What really happens? #Shorts'), {'aspect': '9:16', 'length': 'short'}, shots([(60, None)])), [])
    def test_titles_need_exactly_one_best(self):
        m = meta('x #Shorts', titles=[{'text': 'A', 'best': True}, {'text': 'B', 'best': True}, {'text': 'C', 'best': False}])
        self.assertTrue(any('best' in e for e in PB.validate(m, {'aspect': '9:16', 'length': 'short'}, shots([(60, None)]))))
    def test_short_description_must_be_short(self):
        self.assertTrue(any('short' in e.lower() for e in PB.validate(meta('word ' * 200), {'aspect': '9:16', 'length': 'short'}, shots([(60, None)]))))
    def test_no_handwritten_timestamps(self):
        errs = PB.validate(meta('Overview.\n00:00 Intro\n01:25 Main\n{{chapters}}'), {'aspect': '16:9', 'length': 'long'}, LONG)
        self.assertTrue(any('timestamp' in e for e in errs))
    def test_long_needs_chapters_placeholder(self):
        self.assertTrue(any('{{chapters}}' in e for e in PB.validate(meta('Overview only.'), {'aspect': '16:9', 'length': 'long'}, LONG)))
    def test_tags_rules(self):
        cfg, s = {'aspect': '9:16', 'length': 'short'}, shots([(60, None)])
        self.assertTrue(any('tags' in e for e in PB.validate(meta('x', tags=['a', 'b']), cfg, s)))
        self.assertTrue(any('duplicate' in e for e in PB.validate(meta('x', tags=GOOD_TAGS + ['1000 IQ']), cfg, s)))
        self.assertTrue(any('500' in e for e in PB.validate(meta('x', tags=GOOD_TAGS + ['t' * 59 + str(i) for i in range(8)]), cfg, s)))

class Output(unittest.TestCase):
    def test_long_description_gets_real_chapters(self):
        d = PB.final_description(meta('Overview.\n\nChapters:\n{{chapters}}\n\nSubscribe!'), {'aspect': '16:9', 'length': 'long'}, LONG)
        self.assertIn('00:00 Introduction\n00:20 Waking up a genius\n01:30 What IQ measures\n02:30 Conclusion', d)
        self.assertNotIn('{{chapters}}', d)
    def test_report_sections_in_order(self):
        md = PB.report(meta('Wake up with a 1000 IQ. #Shorts'), {'aspect': '9:16', 'length': 'short', 'title': 'What if you had 1000 IQ'}, shots([(60, None)]),
                       {'path': 'out/x_thumbnail.jpg', 'width': 1080, 'height': 1920, 'bytes': 400000})
        heads = ['## 1. Video Title', '## 2. Video Description', '## 3. Video Tags', '## 4. Generated Thumbnail', '## 5. Thumbnail Resolution and Aspect Ratio']
        pos = [md.find(h) for h in heads]; self.assertTrue(all(p >= 0 for p in pos)); self.assertEqual(pos, sorted(pos))
        self.assertIn('★', md); self.assertIn('1080 × 1920', md); self.assertIn('9:16', md)

if __name__ == '__main__': unittest.main()
