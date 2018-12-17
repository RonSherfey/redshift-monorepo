import { exec } from 'child_process';

/**
 * Mine the specified number of bitcoin blocks
 * @param count The number of blocks to mine
 */
export async function mineBlocks(count: number = 1) {
  return new Promise((resolve, reject) => {
    exec(
      `docker-compose run test-btcctl generate ${count}`,
      (err, stdout, stderr) => {
        if (stdout) return resolve();
        reject(err);
      },
    );
  });
}
