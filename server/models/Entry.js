import mongoose from 'mongoose';

const entrySchema = new mongoose.Schema(
    {
        date: {
            type: String,
            required: [true, 'Date is required'],
            match: [/^\d{2}-\d{2}-\d{4}$/, 'Date must be in DD-MM-YYYY format'],
        },
        totalHours: {
            type: Number,
            required: [true, 'Total hours is required'],
            min: [0, 'Total hours must be >= 0'],
        },
        history: [
            {
                totalHours: { type: Number, required: true },
                updatedAt: { type: Date, default: Date.now },
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Index for efficient date queries
entrySchema.index({ date: 1 }, { unique: true });

const Entry = mongoose.model('Entry', entrySchema);

export default Entry;
