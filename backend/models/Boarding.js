const mongoose = require('mongoose');

const boardingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    area: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    monthlyRent: { type: Number, required: true, min: 0 },
    roomType: { type: String, enum: ['Single', 'Double', 'Shared', 'Annex'], default: 'Single' },
    gender: { type: String, enum: ['boys', 'girls', 'any'], default: 'any' },
    facilities: [{ type: String, trim: true }],
    ownerName: { type: String, trim: true },
    ownerContact: { type: String, required: true, trim: true },
    available: { type: Boolean, default: true },
    availableFrom: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Boarding', boardingSchema);
