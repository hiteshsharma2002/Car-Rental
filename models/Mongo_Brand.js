const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    brandname: { type: String, required: true },
},{ timestamps: true });

const mong2 = mongoose.model('branddetails', brandSchema);

module.exports = mong2;
