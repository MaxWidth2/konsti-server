/* @flow */
import type { User } from 'flow/user.flow'
import type { Game } from 'flow/game.flow'
import type { Result } from 'flow/result.flow'

const buildSignupResults = (
  results: $ReadOnlyArray<$ReadOnlyArray<number>>,
  signedGames: $ReadOnlyArray<Game>,
  players: $ReadOnlyArray<User>
): $ReadOnlyArray<Result> => {
  const signupResults = []

  // Build signup results
  for (let i = 0; i < results.length; i += 1) {
    // Row determines the game
    const selectedRow = parseInt(results[i][0], 10)

    // Player id
    const selectedPlayer = parseInt(results[i][1], 10)

    let attendanceRange = 0

    const findEnteredGame = (enteredGame, signedGames) => {
      return signedGames.find(
        signedGame => signedGame.gameDetails.gameId === enteredGame.gameId
      )
    }

    // Figure what games the row numbers are
    for (let j = 0; j < signedGames.length; j += 1) {
      attendanceRange += signedGames[j].maxAttendance

      // Found game
      if (selectedRow < attendanceRange) {
        let enteredGame = findEnteredGame(
          signedGames[j],
          players[selectedPlayer].signedGames
        )

        if (!enteredGame)
          throw new Error('Unable to find entered game from signed games')

        signupResults.push({
          username: players[selectedPlayer].username,
          enteredGame,
          signedGames: players[selectedPlayer].signedGames,
        })
        break
      }
    }
  }
  return signupResults
}

export default buildSignupResults
