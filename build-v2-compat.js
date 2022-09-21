const execSync = require('child_process').execSync;

const arg = process.argv[2] || 'firefox'; // Default value `dv` if no args provided via CLI.

execSync('git clone -b v2-compat https://github.com/Bill13579/tabby.git v2-compat', {stdio:[0, 1, 2]});
execSync('npm i', {stdio:[0, 1, 2], cwd: './v2-compat'});
execSync(`npm run build:${arg}`, {stdio:[0, 1, 2], cwd: './v2-compat'});
execSync('mkdir -p ./dist/background/', {stdio:[0, 1, 2]});
execSync('mv ./v2-compat/dist/tabby2-background.js ./dist/background/tabby2-background.js', {stdio:[0, 1, 2]});
execSync('rimraf v2-compat', {stdio:[0, 1, 2]});
