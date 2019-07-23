/* @flow */
import { logger } from 'utils/logger'
import { Game } from 'db/game/gameSchema'
import type { KompassiGame } from 'flow/game.flow'

const removeGames = async (): Promise<any> => {
  logger.info('MongoDB: remove ALL games from db')
  try {
    return await Game.deleteMany({})
  } catch (error) {
    logger.error(`MongoDB: Error removing games - ${error}`)
    return error
  }
}

// Save all games to db
const saveGames = async (games: $ReadOnlyArray<KompassiGame>): Promise<any> => {
  logger.info('MongoDB: Store games to DB')
  const gameDocs = []

  games.forEach(game => {
    const gameDoc = new Game({
      gameId: game.identifier,
      title: game.title,
      description: game.description,
      location: game.room_name,
      startTime: game.start_time,
      mins: game.length,
      tags: game.tags,
      genres: game.genres,
      styles: game.styles,
      language: game.language,
      endTime: game.end_time,
      people: game.formatted_hosts,
      minAttendance: game.min_players,
      maxAttendance: game.max_players,
      gameSystem: game.rpg_system,
      englishOk: game.english_ok,
      childrenFriendly: game.children_friendly,
      ageRestricted: game.age_restricted,
      beginnerFriendly: game.beginner_friendly,
      intendedForExperiencedParticipants:
        game.intended_for_experienced_participants,
      shortDescription: game.short_blurb,
      revolvingDoor: game.revolving_door,
      popularity: 0,
    })

    gameDocs.push(gameDoc)
  })

  // Remove existing documents
  try {
    await removeGames()
  } catch (error) {
    logger.error(`Error removing old db entries: ${error}`)
    return Promise.reject(error)
  }

  let response = null
  try {
    response = await Game.create(gameDocs)
    logger.info('MongoDB: Games saved to DB succesfully')
    return response
  } catch (error) {
    // TODO: Collect and return all errors, now only catches one
    logger.error(`Error saving game to db: ${error}`)
    return Promise.reject(error)
  }
}

const findGames = async (): Promise<any> => {
  let response = null
  try {
    response = await Game.find({}).lean()
    logger.debug(`MongoDB: Find all games`)
    return response
  } catch (error) {
    logger.error(`MongoDB: Error fetcing games - ${error}`)
    return error
  }
}

const updateGamePopularity = async (
  gameId: string,
  popularity: number
): Promise<any> => {
  logger.debug(`MongoDB: Update game ${gameId} popularity to ${popularity}`)
  try {
    return await Game.updateOne(
      {
        gameId,
      },
      {
        popularity,
      }
    )
  } catch (error) {
    logger.errog(`Error updating game popularity: ${error}`)
  }
}

export const game = { saveGames, findGames, removeGames, updateGamePopularity }
