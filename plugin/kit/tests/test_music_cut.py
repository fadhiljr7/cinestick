import sys, unittest
from pathlib import Path
import numpy as np
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'audio'))
import music as M
from dsp import SR

class MusicCut(unittest.TestCase):
    def test_cut_section_leaves_silence_before_next(self):
        plan = [{'start': 0, 'end': 6, 'mood': 'tension', 'intensity': 0.6, 'cut': True}, {'start': 6.4, 'end': 12, 'mood': 'mystery', 'intensity': 0.4}]
        y = M.render_score(plan, 12)
        rms = lambda a, b: float(np.sqrt(np.mean(y[int(a * SR):int(b * SR)] ** 2)))
        self.assertLess(rms(6.12, 6.38), rms(3, 5) * 0.05)

if __name__ == '__main__': unittest.main()
