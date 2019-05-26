/* @flow */
import mongoose from 'mongoose'

const ResultsSchema = mongoose.Schema({
  result: [
    {
      username: String,
      enteredGame: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
      signedGames: [{ gameId: String, priority: Number, time: Date }],
    },
  ],
  startTime: Date,
  created: { type: Date, default: Date.now },
})

const Results = mongoose.model('Results', ResultsSchema)

export default Results
