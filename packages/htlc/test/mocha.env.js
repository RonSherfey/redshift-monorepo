const dotenv = require('dotenv'),
      path = require('path'),
      fs = require('fs');

dotenv.config();

/**
 * Add test environment variables
 */
const envConfig = dotenv.parse(fs.readFileSync(path.join(__dirname, '../.env.test'),));
for (const key in envConfig) {
  process.env[key] = envConfig[key];
}
