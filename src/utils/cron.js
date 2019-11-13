// @flow
import moment from 'moment';
import schedule from 'node-schedule';
import { logger } from 'utils/logger';
import { db } from 'db/mongodb';
import { updateGames } from 'api/controllers/gamesController';
import { config } from 'config';
import { updateGamePopularity } from 'game-popularity/updateGamePopularity';
import { removeOverlappingSignups } from 'player-assignment/utils/removeOverlappingSignups';
import { doAssignment } from 'player-assignment/utils/doAssignment';
import { saveResults } from 'player-assignment/utils/saveResults';
import { sleep } from 'utils/sleep';
import { kompassiGameMapper } from 'utils/kompassiGameMapper';

const {
  autoUpdateGamesEnabled,
  gameUpdateInterval,
  autoUpdateGamePopularityEnabled,
  autoAssignPlayersEnabled,
} = config;

export const autoUpdateGames = async (): Promise<void> => {
  if (autoUpdateGamesEnabled || autoUpdateGamePopularityEnabled) {
    await schedule.scheduleJob(
      `*/${gameUpdateInterval} * * * *`,
      async (): Promise<void> => {
        if (autoUpdateGamesEnabled) {
          logger.info('----> Auto update games');
          const kompassiGames = await updateGames();
          await db.game.saveGames(kompassiGameMapper(kompassiGames));
          logger.info('***** Games auto update completed');
        }

        if (autoUpdateGamePopularityEnabled) {
          logger.info('----> Auto update game popularity');
          await updateGamePopularity();
          logger.info('***** Game popularity auto update completed');
        }
      }
    );
  }
};

export const autoAssignPlayers = async (): Promise<void> => {
  if (autoAssignPlayersEnabled) {
    await schedule.scheduleJob(`30 * * * *`, async (): Promise<void> => {
      logger.info('----> Auto assign players');
      // 30 * * * * -> “At minute 30.”
      // */1 * * * * -> “Every minute”

      const startTime = moment()
        .endOf('hour')
        .add(1, 'seconds')
        .format();

      // const startTime = '2019-07-26T14:00:00Z';

      // Wait for final signup requests
      logger.info('Wait 10s for final requests');
      await sleep(10000);

      logger.info('Waiting done, start assignment');
      const assignResults = await doAssignment(startTime);

      // console.log('>>> assignResults: ', assignResults)

      if (assignResults.results.length === 0) return;

      // Save results
      try {
        await saveResults(
          assignResults.results,
          startTime,
          assignResults.algorithm,
          assignResults.message
        );
      } catch (error) {
        logger.error(`saveResult error: ${error}`);
      }

      // Set which results are shown
      try {
        await db.settings.saveSignupTime(startTime);
      } catch (error) {
        logger.error(`db.settings.saveSignupTime error: ${error}`);
      }

      // Remove overlapping signups
      if (config.enableRemoveOverlapSignups) {
        if (assignResults.newSignupData.length === 0) return;

        logger.info('Remove overlapping signups');

        try {
          await removeOverlappingSignups(assignResults.newSignupData);
        } catch (error) {
          logger.error(`removeOverlappingSignups error: ${error}`);
        }
      }

      logger.info('***** Automatic player assignment completed');
    });
  }
};
