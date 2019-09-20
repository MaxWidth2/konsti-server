// @flow
import moment from 'moment'
import { logger } from 'utils/logger'
import { db } from 'db/mongodb'
import { validateAuthHeader } from 'utils/authHeader'
import type { $Request, $Response, Middleware } from 'express'

// Add signup data for user
const postSignup: Middleware = async (
  req: $Request,
  res: $Response
): Promise<void> => {
  logger.info('API call: POST /api/signup')
  const signupData = req.body.signupData

  const authHeader = req.headers.authorization
  const validToken = validateAuthHeader(authHeader, 'user')

  if (!validToken) {
    return res.sendStatus(401)
  }

  const { selectedGames, username, signupTime } = signupData

  if (!signupTime) {
    return res.json({
      message: 'Signup failure',
      status: 'error',
    })
  }

  const timeNow = moment()

  if (signupTime !== 'all' && moment(signupTime).isBefore(timeNow)) {
    const error = `Signup time ${moment(
      signupTime
    ).format()} does not match: too late`

    logger.debug(error)
    return res.json({
      code: 41,
      message: 'Signup failure',
      status: 'error',
      error,
    })
  }

  const modifiedSignupData = {
    signedGames: selectedGames,
    username,
  }

  try {
    const response = await db.user.saveSignup(modifiedSignupData)
    return res.json({
      message: 'Signup success',
      status: 'success',
      signedGames: response.signedGames,
    })
  } catch (error) {
    return res.json({
      message: 'Signup failure',
      status: 'error',
      error,
    })
  }
}

export { postSignup }
