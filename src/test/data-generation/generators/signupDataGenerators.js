/* @flow */
import _ from 'lodash'
import { logger } from 'utils/logger'
import { db } from 'db/mongodb'
import { getRandomInt } from 'test/data-generation/generators/randomVariableGenerators'
import type { User } from 'flow//user.flow'
import type { Game } from 'flow/game.flow'

const getRandomSignup = (games: $ReadOnlyArray<Game>, user: User) => {
  const randomGames = []
  let randomIndex

  // Select three random games
  for (let i = 0; i < 3; i += 1) {
    randomIndex = getRandomInt(0, games.length - 1)
    const randomGame = games[randomIndex]
    if (randomGames.includes(randomGame)) {
      i -= 1
    } else {
      randomGames.push(randomGame)
    }
  }

  // Save random games with priorities
  const gamesWithPriorities = []
  randomGames.forEach((randomGame, index) => {
    gamesWithPriorities.push({
      gameDetails: randomGame,
      priority: index + 1,
      time: randomGame.startTime,
    })
  })

  return {
    randomGames,
    gamesWithPriorities,
  }
}

const signup = (games: $ReadOnlyArray<Game>, user: User) => {
  const signup = getRandomSignup(games, user)

  /*
  logger.info(
    `Signup: Selected games: ${signup.randomGames.toString()} for "${
      user.username
    }"`
  )
  */

  return db.user.saveSignup({
    username: user.username,
    signedGames: signup.gamesWithPriorities,
  })

  // TODO: Different users: some sign for all three, some for one
}

const signupMultiple = (
  games: $ReadOnlyArray<Game>,
  users: $ReadOnlyArray<User>
) => {
  const promises = []

  for (let user of users) {
    if (user.username !== 'admin' /* && user.username !== 'test' */) {
      promises.push(signup(games, user))
    }
  }

  return Promise.all(promises)
}

const signupGroup = async (
  games: $ReadOnlyArray<Game>,
  users: $ReadOnlyArray<User>
) => {
  // Generate random signup data for the first user
  const signup = getRandomSignup(games, _.first(users))

  // Assign same signup data for group members
  const promises = []
  for (let i = 0; i < users.length; i++) {
    /*
    logger.info(
      `Signup: Selected games: ${signup.randomGames.toString()} for "${
        users[i].username
      }"`
    )
    */

    let signupData = {
      username: users[i].username,
      signedGames: i === 0 ? signup.gamesWithPriorities : [],
    }

    promises.push(db.user.saveSignup(signupData))
  }

  return Promise.all(promises)
}

const createSignupData = async (strategy: string) => {
  logger.info('Generate signup data')

  let games: $ReadOnlyArray<Game> = []
  let users: $ReadOnlyArray<User> = []

  try {
    games = await db.game.findGames()
    users = await db.user.findUsers()
  } catch (error) {
    logger.error(error)
  }

  logger.info(`Signup: ${games.length} games`)
  logger.info(`Signup: ${users.length} users`)
  logger.info(`Signup: Generate signup data for ${users.length} users`)

  if (strategy === 'munkres') {
    await signupMultiple(games, users)
  } else if (strategy === 'group') {
    // Group all unique group numbers
    const groupedUsers = users.reduce((acc, user) => {
      acc[user['playerGroup']] = acc[user['playerGroup']] || []
      acc[user['playerGroup']].push(user)
      return acc
    }, {})

    for (const [key: String, value: $ReadOnlyArray<User>] of Object.entries(
      groupedUsers
    )) {
      // $FlowFixMe
      let array = [...value]
      if (key === '0') {
        logger.info('SIGNUP INDIVIDUAL USERS')
        await signupMultiple(games, array)
      } else {
        logger.info(`SIGNUP GROUP ${key}`)
        await signupGroup(games, array)
      }
    }
  }
}

export { createSignupData }
