const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    pass: { type: String, required: true }, // Use hashed passwords for better security
    role: { type: String, default: 'admin' },
},{ timestamps: true });

const mong1 = mongoose.model('admindetails', adminSchema);

module.exports = mong1;
