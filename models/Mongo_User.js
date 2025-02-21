const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({ name: { type: String, required: true }, email: { type: String, required: true }, pass: { type: String, required: true }, role: { type: String, default: 'user' } }, { timestamps: true });

const mong = mongoose.model('userdetails', userSchema);

module.exports = mong;