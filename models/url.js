const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: {
    type: Number,
    unique: true
  }
});

urlSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const count = await mongoose.model('Url').countDocuments();
      this.short_url = count + 1;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

const Url = mongoose.model('Url', urlSchema);

module.exports = Url;