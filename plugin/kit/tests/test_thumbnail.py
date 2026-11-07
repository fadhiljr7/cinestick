import sys, unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'tools'))
import thumbnail as TH

class Sizes(unittest.TestCase):
    def test_size_follows_aspect(self):
        self.assertEqual(TH.thumb_size({'aspect': '9:16'}), (1080, 1920)); self.assertEqual(TH.thumb_size({'aspect': '16:9'}), (1280, 720))
    def test_render_scale(self):
        self.assertAlmostEqual(TH.render_scale({'aspect': '9:16', 'resolution': '1080p'}), 1.0)
        self.assertAlmostEqual(TH.render_scale({'aspect': '16:9', 'resolution': '1080p'}), 720 / 1080)
        self.assertAlmostEqual(TH.render_scale({'aspect': '9:16', 'resolution': '720p'}), 1.5)
        self.assertAlmostEqual(TH.render_scale({'aspect': '16:9', 'resolution': '2160p'}), 1 / 3)
    def test_out_path(self):
        self.assertEqual(TH.out_path(Path('/p'), {'title': 'What if you had 1000 IQ?'}), Path('/p/out/What_if_you_had_1000_IQ_thumbnail.jpg'))

if __name__ == '__main__': unittest.main()
