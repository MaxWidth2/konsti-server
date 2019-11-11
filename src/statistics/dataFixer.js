// @flow
import { readJson, writeJson } from './statsUtil';

const fixData = async (): Promise<void> => {
  const data = readJson();

  // Implement fixer logic here
  data.forEach(dataEntry => {
    dataEntry.username = dataEntry.username.toUpperCase();
  });

  writeJson(data);
};

fixData();
