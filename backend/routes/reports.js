const router = require('express').Router();
const Report = require('../models/Report');
const { protect, adminOnly } = require('../middleware/auth');

// Customer: submit a report
router.post('/', protect, async (req, res, next) => {
  try {
    const { boarding, type, message } = req.body;
    const r = await Report.create({ user: req.user._id, boarding: boarding || undefined, type, message });
    res.status(201).json(r);
  } catch (e) {
    e.status = 400;
    next(e);
  }
});

// Customer: own reports
router.get('/mine', protect, async (req, res, next) => {
  try {
    res.json(await Report.find({ user: req.user._id }).populate('boarding', 'name area').sort({ createdAt: -1 }));
  } catch (e) {
    next(e);
  }
});

// Admin: all reports
router.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    res.json(await Report.find().populate('user', 'name email').populate('boarding', 'name area').sort({ createdAt: -1 }));
  } catch (e) {
    next(e);
  }
});

// Admin: update status
router.patch('/:id/status', protect, adminOnly, async (req, res, next) => {
  try {
    const r = await Report.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
    if (!r) return res.status(404).json({ message: 'Not found' });
    res.json(r);
  } catch (e) {
    e.status = 400;
    next(e);
  }
});

module.exports = router;
