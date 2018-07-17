import logger from '/utils/logger'
import assignPlayers from '/player-assignment/assignPlayers'
import db from '/db/mongodb'
import config from '/config'

const testAssignPlayers = async () => {
  const strategy = process.argv[2]

  if (!strategy || (strategy !== 'munkres' && strategy !== 'group')) {
    logger.error('Give strategy parameter, possible: "munkres", "group"')
    process.exit()
  }

  if (config.env !== 'development') {
    logger.error(
      `Player allocation only allowed in dev environment, current env "${
        config.env
      }"`
    )
    process.exit()
  }

  try {
    await db.connectToDb()
  } catch (error) {
    logger.error(error)
  }

  let users = []
  try {
    users = await db.user.findUsers()
  } catch (error) {
    logger.error(error)
  }

  let games = []
  try {
    games = await db.game.findGames()
  } catch (error) {
    logger.error(error)
  }

  const startingTime = '2018-07-27T14:00:00Z'

  await assignPlayers(users, games, startingTime, strategy)

  // const result = await assignPlayers(users, games, startingTime, strategy)
  // logger.info(`Result: ${JSON.stringify(result, null, 2)}`)

  process.exit()
}

testAssignPlayers()
