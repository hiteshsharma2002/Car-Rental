const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    car: { type: String, ref: 'mong2' },
    over: { type: String, required: true },
    price: { type: Number, required: true },
    fuel: { type: String, enum: ['petrol', 'diesel', 'electric', 'hybrid'] },
    carmodel: { type: Number, required: true },
    seating: { type: Number, required: true },
    image: {
        type: [String], // An array to store multiple image paths
      },

},{ timestamps: true });

const mong3 = mongoose.model('vehicledetails', vehicleSchema);

module.exports = mong3;
