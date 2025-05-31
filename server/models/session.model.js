const mongoose = require('mongoose');

const sessionSchema =  mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  workDuration: { type: Number, required: true },   // in minutes
  breakDuration: { type: Number, required: true },  // in minutes
    task: { type: String},
  status: {
    type: String,
    enum: ['running', 'completed', 'aborted'],
    default: 'running'
  },
  interruptions: { type: Number, default: 0 },
  abortReason: { type: String }
});

const SessionModel= mongoose.model('Session', sessionSchema);
module.exports = { SessionModel };
