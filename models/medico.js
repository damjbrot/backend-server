var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var medicoSchema = new Schema({
    
    nombre : { type: String, required: [true, 'El nombre es obligatorio'] }, 
    img : { type: String, required: false }, 
    hospital : { type: Schema.Types.ObjectId, ref: 'Hospital'},
    usuario : { type: Schema.Types.ObjectId, ref: 'Usuario'}
}, { collection: 'medicos' });

module.exports = mongoose.model('Medico', medicoSchema);