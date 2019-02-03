const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');


mongoosePaginate.paginate.options = {
  limit: 3 // how many records on each page
};

const PetSchema = new Schema({
  name: { type: String, required: [true, 'Give that little guy a name!'] }, 
  birthday: {type: String, required: [true, "I'm pretty sure the pup has a birthday"]},
  species: { type: String, required: [true, 'Uh-oh forgot the species'] },
  picUrl: { type: String },
  picUrlSq: { type: String },
  avatarUrl: { type: String, required: [true, 'Avatar photo failed to load or need there needs to be a photo']},
  favoriteFood: { type: String, required: [true, 'What about a favorite food?'] },
  description: { type: String, min: [100, 'Pets find homes faster with a good description.'] },
  price: { type: Number, required: true }
}, {
  timestamps: true
});

PetSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Pet', PetSchema);
