// @flow
import faker from 'faker';
import {
  createIndividualUsers,
  createAdminUser,
  createTestUsers,
  createUsersInGroup,
  createHelpUser,
} from 'test/data-generation/generators/createUsers';
import { createGames } from 'test/data-generation/generators/createGames';
import { createSignups } from 'test/data-generation/generators/createSignups';
import { config } from 'config';

export const generateTestData = async (
  newUsersCount: number,
  newGamesCount: number,
  groupSize: number,
  numberOfGroups: number,
  testUsersCount: number
): Promise<void> => {
  const { generateSignups } = config;

  await createAdminUser();
  await createHelpUser();

  if (testUsersCount) await createTestUsers(testUsersCount);
  if (newUsersCount) await createIndividualUsers(newUsersCount);

  for (let i = 0; i < numberOfGroups; i++) {
    const randomGroupCode = faker.random.number().toString();
    await createUsersInGroup(groupSize, randomGroupCode);
  }

  await createGames(newGamesCount);

  if (generateSignups) {
    await createSignups();
  }
};
