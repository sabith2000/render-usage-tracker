import express from 'express';
import Entry from '../models/Entry.js';

const router = express.Router();

/**
 * Helper: parse DD-MM-YYYY to a sortable value.
 */
function parseDateToSortable(dateStr) {
    const [dd, mm, yyyy] = dateStr.split('-');
    return `${yyyy}-${mm}-${dd}`;
}

/**
 * GET /api/entries
 * Returns all entries sorted chronologically.
 */
router.get('/', async (req, res) => {
    try {
        const entries = await Entry.find().lean();
        // Sort chronologically by parsed date
        entries.sort(
            (a, b) => parseDateToSortable(a.date).localeCompare(parseDateToSortable(b.date))
        );
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch entries', error: error.message });
    }
});

/**
 * POST /api/entries
 * Create a new entry.
 */
router.post('/', async (req, res) => {
    try {
        const { date, totalHours } = req.body;

        // Check for duplicate date
        const existing = await Entry.findOne({ date });
        if (existing) {
            return res.status(400).json({ message: `Entry for ${date} already exists` });
        }

        const entry = new Entry({ date, totalHours: Number(totalHours) });
        const saved = await entry.save();
        res.status(201).json(saved);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Failed to create entry', error: error.message });
    }
});

/**
 * PUT /api/entries/:id
 * Update an existing entry.
 */
router.put('/:id', async (req, res) => {
    try {
        const { date, totalHours } = req.body;

        // Check for duplicate date (exclude current entry)
        if (date) {
            const existing = await Entry.findOne({ date, _id: { $ne: req.params.id } });
            if (existing) {
                return res.status(400).json({ message: `Entry for ${date} already exists` });
            }
        }

        const updated = await Entry.findByIdAndUpdate(
            req.params.id,
            { date, totalHours: Number(totalHours) },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ message: 'Entry not found' });
        }

        res.json(updated);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Failed to update entry', error: error.message });
    }
});

/**
 * DELETE /api/entries/:id
 * Delete an entry.
 */
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Entry.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Entry not found' });
        }
        res.json({ message: 'Entry deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete entry', error: error.message });
    }
});

export default router;
