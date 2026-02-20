import express from 'express';
import Entry from '../models/Entry.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * Helper: parse DD-MM-YYYY to a sortable value YYYY-MM-DD.
 * Used for chronological sorting of entries.
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
    logger.info('   [GET] Fetching all entries...');
    try {
        const entries = await Entry.find().lean();

        // Sort chronologically by parsed date
        entries.sort(
            (a, b) => parseDateToSortable(a.date).localeCompare(parseDateToSortable(b.date))
        );

        logger.info(`   ✅ Found ${entries.length} entries.`);
        res.json(entries);
    } catch (error) {
        logger.error(`   ❌ Error fetching entries: ${error.message}`);
        res.status(500).json({ message: 'Failed to fetch entries', error: error.message });
    }
});

/**
 * POST /api/entries
 * Create a new entry.
 */
router.post('/', async (req, res) => {
    const { date, totalHours } = req.body;
    logger.info(`   [POST] Attempting to create entry: Date=${date}, Hours=${totalHours}`);

    try {
        // Check for duplicate date
        const existing = await Entry.findOne({ date });
        if (existing) {
            logger.warn(`   ⚠️ Duplicate entry prevented for date: ${date}`);
            return res.status(400).json({ message: `Entry for ${date} already exists` });
        }

        const entry = new Entry({ date, totalHours: Number(totalHours) });
        const saved = await entry.save();

        logger.info(`   ✅ Entry created successfully! ID: ${saved._id}`);
        res.status(201).json(saved);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            logger.warn(`   ⚠️ Validation Error: ${messages.join(', ')}`);
            return res.status(400).json({ message: messages.join(', ') });
        }
        logger.error(`   ❌ Error creating entry: ${error.message}`);
        res.status(500).json({ message: 'Failed to create entry', error: error.message });
    }
});

/**
 * PUT /api/entries/:id
 * Update an existing entry.
 */
router.put('/:id', async (req, res) => {
    const { date, totalHours } = req.body;
    logger.info(`   [PUT] Updating entry ${req.params.id}: Date=${date}, Hours=${totalHours}`);

    try {
        // Check for duplicate date (exclude current entry)
        if (date) {
            const existing = await Entry.findOne({ date, _id: { $ne: req.params.id } });
            if (existing) {
                logger.warn(`   ⚠️ Update failed: Date ${date} is already taken by another entry.`);
                return res.status(400).json({ message: `Entry for ${date} already exists` });
            }
        }

        // Fetch current entry to snapshot its state before updating
        const current = await Entry.findById(req.params.id);
        if (!current) {
            logger.warn(`   ⚠️ Entry not found for update: ${req.params.id}`);
            return res.status(404).json({ message: 'Entry not found' });
        }

        // Push current totalHours into history, capped at last 20 records
        const updated = await Entry.findByIdAndUpdate(
            req.params.id,
            {
                $set: { date, totalHours: Number(totalHours) },
                $push: {
                    history: {
                        $each: [{ totalHours: current.totalHours, updatedAt: new Date() }],
                        $slice: -20,
                    },
                },
            },
            { new: true, runValidators: true }
        );

        logger.info(`   ✅ Entry updated successfully! History now has ${updated.history.length} record(s).`);
        res.json(updated);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            logger.warn(`   ⚠️ Validation Error: ${messages.join(', ')}`);
            return res.status(400).json({ message: messages.join(', ') });
        }
        logger.error(`   ❌ Error updating entry: ${error.message}`);
        res.status(500).json({ message: 'Failed to update entry', error: error.message });
    }
});

/**
 * DELETE /api/entries/:id
 * Delete an entry.
 */
router.delete('/:id', async (req, res) => {
    logger.info(`   [DELETE] Request to delete entry: ${req.params.id}`);

    try {
        const deleted = await Entry.findByIdAndDelete(req.params.id);
        if (!deleted) {
            logger.warn(`   ⚠️ Entry not found for deletion.`);
            return res.status(404).json({ message: 'Entry not found' });
        }
        logger.info(`   ✅ Entry deleted successfully.`);
        res.json({ message: 'Entry deleted successfully' });
    } catch (error) {
        logger.error(`   ❌ Error deleting entry: ${error.message}`);
        res.status(500).json({ message: 'Failed to delete entry', error: error.message });
    }
});

export default router;
