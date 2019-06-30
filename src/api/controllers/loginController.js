/* @flow */
import { logger } from 'utils/logger'
import { db } from 'db/mongodb'
import { comparePasswordHash } from 'utils/bcrypt'
import { getJWT, verifyJWT } from 'utils/jwt'

const validateLogin = async (loginData, hash) => {
  let response = null
  try {
    response = await comparePasswordHash(loginData.password.trim(), hash)

    // Password matches hash
    if (response === true) {
      return true
    }
    return false
  } catch (error) {
    return error
  }
}

const postLogin = async (req: Object, res: Object) => {
  logger.info('API call: POST /api/login')
  const loginData = req.body.loginData

  if (loginData.jwt) {
    const jwtResponse = verifyJWT(loginData.jwt, 'user')

    if (jwtResponse.status === 'error') {
      res.sendStatus(422)
      return
    }

    if (typeof jwtResponse.username === 'string') {
      let user = null
      try {
        user = await db.user.findUser(jwtResponse.username)
      } catch (error) {
        logger.error(`Login: ${error}`)
        res.json({
          message: 'Session restore error',
          status: 'error',
          error,
        })
        return
      }

      res.json({
        message: 'Session restore success',
        status: 'success',
        username: user.username,
        userGroup: user.userGroup,
        serial: user.serial,
        groupCode: user.groupCode,
        jwt: getJWT(user.userGroup, user.username),
      })
      return
    }
  }

  if (!loginData || !loginData.username || !loginData.password) {
    res.sendStatus(422)
    return
  }

  let user = null
  try {
    user = await db.user.findUser(loginData.username)
  } catch (error) {
    logger.error(`Login: ${error}`)
    res.json({
      message: 'User login error',
      status: 'error',
      error,
    })
    return
  }

  // User does not exist
  if (!user) {
    logger.info(`Login: User "${loginData.username}" not found`)
    res.json({
      code: 21,
      message: 'User login error',
      status: 'error',
    })
    return
  }

  let settingsResponse
  try {
    settingsResponse = await db.settings.findSettings()
  } catch (error) {
    logger.error(`Login: ${error}`)
    res.json({
      message: 'User login error',
      status: 'error',
      error,
    })
    return
  }

  if (!settingsResponse.appOpen && user.userGroup === 'user') {
    res.json({
      code: 22,
      message: 'User login disabled',
      status: 'error',
    })
    return
  }

  // User exists
  let validLogin
  try {
    validLogin = await validateLogin(loginData, user.password)

    logger.info(
      `Login: User "${user.username}" with "${user.userGroup}" user group`
    )

    if (validLogin === true) {
      logger.info(
        `Login: Password for user "${loginData.username.trim()}" matches`
      )
      res.json({
        message: 'User login success',
        status: 'success',
        username: user.username,
        userGroup: user.userGroup,
        serial: user.serial,
        groupCode: user.groupCode,
        jwt: getJWT(user.userGroup, user.username),
      })
      return
    } else {
      logger.info(
        `Login: Password for user "${loginData.username}" doesn't match`
      )

      res.json({
        code: 21,
        message: 'User login failed',
        status: 'error',
      })
      return
    }
  } catch (error) {
    logger.error(`Login: ${error}`)
    res.json({
      message: 'User login error',
      status: 'error',
      error,
    })
    // return
  }
}

export { postLogin }
