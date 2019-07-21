/* @flow */
import { logger } from 'utils/logger'
import { db } from 'db/mongodb'
import { assignPlayers } from 'player-assignment/assignPlayers'
import { validateAuthHeader } from 'utils/authHeader'
import { config } from 'config'
import type { User } from 'flow/user.flow'
import type { Game } from 'flow/game.flow'
import type { Signup, Result } from 'flow/result.flow'
import type { $Request, $Response, Middleware } from 'express'

// Assign players to games
const postPlayers: Middleware = async (
  req: $Request,
  res: $Response
): Promise<void> => {
  logger.info('API call: POST /api/players')
  const startingTime = req.body.startingTime

  const authHeader = req.headers.authorization
  const validToken = validateAuthHeader(authHeader, 'admin')

  if (!validToken) {
    return res.sendStatus(401)
  }

  const { assignmentStrategy } = config

  let users: $ReadOnlyArray<User> = []
  try {
    users = await db.user.findUsers()
  } catch (error) {
    logger.error(`findUsers error: ${error}`)
    return res.json({
      message: 'Players assign failure',
      status: 'error',
      error,
    })
  }

  let games: $ReadOnlyArray<Game> = []
  try {
    games = await db.game.findGames()
  } catch (error) {
    logger.error(`findGames error: ${error}`)
    return res.json({
      message: 'Players assign failure',
      status: 'error',
      error,
    })
  }

  let assignResults = null
  try {
    assignResults = assignPlayers(
      users,
      games,
      startingTime,
      assignmentStrategy
    )
  } catch (error) {
    logger.error(`Player assign error: ${error}`)
    return res.json({
      message: 'Players assign failure',
      status: 'error',
      error,
    })
  }

  logger.info(assignResults.message)

  if (!assignResults || !assignResults.results) {
    return res.json({
      message: 'Players assign failure',
      status: 'error',
    })
  }

  try {
    await saveResults(assignResults.results, startingTime)
  } catch (error) {
    logger.error(`saveResult error: ${error}`)
    return res.json({
      message: 'Players assign failure',
      status: 'error',
      error,
    })
  }

  // Remove overlapping signups
  if (config.removeOverlapSignups && assignResults.newSignupData) {
    try {
      logger.info('Remove overlapping signups')
      await removeOverlappingSignups(assignResults.newSignupData)
    } catch (error) {
      logger.error(`removeOverlappingSignups error: ${error}`)
      return res.json({
        message: 'Players assign failure',
        status: 'error',
        error,
      })
    }
  }

  return res.json({
    message: 'Players assign success',
    status: 'success',
    results: assignResults.results,
    resultMessage: assignResults.message,
    signups: assignResults.newSignupData,
    startTime: startingTime,
  })
}

export const saveResults = async (
  results: $ReadOnlyArray<Result>,
  startingTime: string
): Promise<any> => {
  try {
    logger.info(
      `Save signup results for starting time ${startingTime} to separate collection`
    )
    await db.results.saveResult(results, startingTime)
  } catch (error) {
    logger.error(`db.results.saveResult error: ${error}`)
    throw new Error('No assign results')
  }

  try {
    logger.info(`Save user signup results for starting time ${startingTime}`)
    await saveUserSignupResults(results)
  } catch (error) {
    logger.error(`saveUserSignupResults: ${error}`)
    throw new Error('No assign results')
  }
}

const saveUserSignupResults = async (
  results: $ReadOnlyArray<Result>
): Promise<any> => {
  try {
    await Promise.all(
      results.map(async assignResult => {
        await db.user.saveSignupResult(assignResult)
      })
    )
  } catch (error) {
    logger.error(`saveSignupResult error: ${error}`)
    throw new Error('No assign results')
  }
}

export const removeOverlappingSignups = async (
  signups: $ReadOnlyArray<Signup>
): Promise<any> => {
  try {
    await Promise.all(
      signups.map(async signup => {
        await db.user.saveSignup(signup)
      })
    )
  } catch (error) {
    logger.error(`saveSignup error: ${error}`)
    throw new Error('No assign results')
  }
}

export { postPlayers }
