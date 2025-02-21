const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    from: { type: String }, to: { type: String }, message: { type: String }, vehicle: { type: String }, fname: { type: String }, status: { type: String, default: 'not confirmed yet' }, postdate: { type: Date, default: Date.now } }
);

const bookmong = mongoose.model('bookings', bookSchema);

module.exports = bookmong;
