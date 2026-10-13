const router = require('express').Router();
const Boarding = require('../models/Boarding');
const { protect, adminOnly } = require('../middleware/auth');

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const clean = (b) => {
  const out = { ...b };
  if ('facilities' in b && !Array.isArray(b.facilities)) {
    out.facilities = String(b.facilities || '').split(',').map((f) => f.trim()).filter(Boolean);
  }
  if ('availableFrom' in b && !b.availableFrom) out.availableFrom = null;
  return out;
};

// Any logged-in user: search by area/city
router.get('/', protect, async (req, res, next) => {
  try {
    const { q, gender, maxRent, availableOnly } = req.query;
    const filter = {};
    if (q) {
      const r = new RegExp(esc(q.trim()), 'i');
      filter.$or = [{ area: r }, { city: r }, { name: r }, { address: r }];
    }
    if (['boys', 'girls', 'any'].includes(gender)) filter.gender = gender;
    if (maxRent) filter.monthlyRent = { $lte: Number(maxRent) };
    if (availableOnly === 'true') filter.available = true;
    res.json(await Boarding.find(filter).sort({ createdAt: -1 }));
  } catch (e) {
    next(e);
  }
});

router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    res.status(201).json(await Boarding.create(clean(req.body)));
  } catch (e) {
    e.status = 400;
    next(e);
  }
});

router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const b = await Boarding.findByIdAndUpdate(req.params.id, clean(req.body), { new: true, runValidators: true });
    if (!b) return res.status(404).json({ message: 'Not found' });
    res.json(b);
  } catch (e) {
    e.status = 400;
    next(e);
  }
});

router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const b = await Boarding.findByIdAndDelete(req.params.id);
    if (!b) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
