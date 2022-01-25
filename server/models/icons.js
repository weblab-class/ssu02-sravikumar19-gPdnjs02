const mongoose = require("mongoose");


const IconsSchema = new mongoose.Schema({
  // Ask from Stella
  creatorId: String,
	type: Number,
	state: { type: Number, default: -1, min:0, max:4 },


});


// compile model from schema
module.exports = mongoose.model("icons", IconsSchema);
