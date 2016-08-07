var path = require('path');
var fs = require('fs');
var configJson = { "key": "" }

config = exports;
config.home = process.env.HOME || process.env.USERPROFILE;
config.home += '/.kipalog';
config.path = path.join(config.home, 'kipalog-cli.json');
config.key = '';
config.write = function(api) {
  configJson.key = String(api);
  fs.writeFileSync(config.path, JSON.stringify(configJson));
}
config.deleteKey = function() {
  configJson.key = '';
  fs.writeFileSync(config.path, JSON.stringify(configJson));
}
config.init = function() {
  try {
    fs.accessSync(config.path, fs.F_OK);
    return config.key = getKey();
  } catch (e) {
    try {
      fs.accessSync(config.home, fs.F_OK);
    } catch (e) {
      fs.mkdir(config.home);
    }
    return '';
  }

  function getKey() {
    try {
      return JSON.parse(fs.readFileSync(config.path, 'utf8')).key;
    } catch (e) {
      return '';
    }
  }
}
