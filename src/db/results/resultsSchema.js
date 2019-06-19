/* @flow */
import mongoose from 'mongoose'

const ResultsSchema = new mongoose.Schema(
  {
    result: [
      {
        username: String,
        enteredGame: {
          gameDetails: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
          priority: Number,
          time: Date,
        },
        signedGames: [
          {
            gameDetails: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
            priority: Number,
            time: Date,
          },
        ],
      },
    ],
    startTime: Date,
  },
  { timestamps: true }
)

export const Results = mongoose.model('Results', ResultsSchema)
