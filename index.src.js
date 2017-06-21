"use strict";

import co from 'co';
import chalk from 'chalk';
import config from './config';
import fs from 'fs';
import hCli from './lib/cli';
import path from 'path';
import prompt from 'co-prompt';
import request from 'request';

let apiUrl = 'http://kipalog.com/api/v1/post';
let key = config.init();

let cliString = {
  sayHi: {
    firstTime: '\nYou have not added your API key yet for using this cli. Please add it. \n\n   run: ' +
      chalk.bold.red('kipalog config <your-api-key>') +
      ' or ' + chalk.bold.red('kipalog config') + '. \n\nIf you need help. Please run: ' +
      chalk.bold.red('kipalog --help') + ' . Thank you.',

    addKey: '\nPlease add your api key below, then press the Enter ' +
      '(or Ctrl + C for exit, of course, if you exit by ctrl + c, your change will be not saved! Press Enter.)',

    addKeyAgain: 'Your api key must not be empty. Try again:',

    notyet: '\nYou have not added your API key yet for use this cli, \nplease add it before you do anything. \n\n   run: ' +
      chalk.bold.red('kipalog config <your-api-key>') +
      ' or ' + chalk.bold.red('kipalog config') + '. \n\nIf you need help. Please run: ' +
      chalk.bold.red('kipalog --help') + ' . Thank you.',
    headHelp: '\nKialog CLI\n\n' + chalk.bold('Usage:') +
      '\n\r     kipalog <command> <options> \n\r or  kipalog [options]\n\n\rPlease use ' + "''" +
      ' or "" if your string has space(s), use / for path.'
  },
  success: {
    addKey: '\nHere is Your API key: "%s", thank you for adding it. \n' +
      'If you want to change this key, run: ' + chalk.bold.red('kipalog config <your-api-key>'),
    post: 'Your post has been submitted. The below is response:',
    get: ''
  },
  error: {
    pathNeed: "\n This preview file has not been found",
    path: "\n This file has not been found",
    status: "\n Error(s) form server:"
  }
}

let argv = process.argv.slice(2);

if (argv.length == 0) {
  // WE NEED A KEYYYYYY
  if (!key) console.log(cliString.sayHi.firstTime);
  else {
    console.log('');
    showHelp();
    process.exit(0);
  };
}

// COMMANDS
let commands = [{
  name: 'post',
  alias: 'p',
  describe: 'Upload your post to Kipalog',
  require: [{
    name: 'path',
    position: 1,
    require: true
  }],
  options: [{
    name: 'title',
    alias: 't',
    require: true
  }, {
    name: 'tag',
    alias: 'tags',
    require: true
  }, {
    name: 'public',
    alias: 'p',
    require: false,
    default: false
  }],
  action: function(agru) {
    if (agru.public && agru.public == 'false') {
      agru.public = false;
    }

    agru.path = path.isAbsolute(agru.path) ? agru.path : path.resolve(process.cwd(), agru.path);
    try {
      fs.accessSync(agru.path, fs.F_OK);
    } catch (e) {
      console.log(cliString.error.path);
      process.exit(1);
    }

    let data = {
      "title": agru.title,
      "content": fs.readFileSync(agru.path, 'utf8'),
      "tag": agru.tag,
      "status": agru.public ? "published" : "draft"
    }

    request({
      method: 'POST',
      uri: apiUrl,
      headers: {
        'Accept-Charset': 'application/json',
        'X-Kipalog-Token': config.key
      },
      json: data
    }, function(error, response, body) {
      if (response.statusCode == 406) {
        console.log('\nInvalid API key');
        process.exit(1);
      }
      if (!error && response.statusCode != 404) {
        if (body && Number(body.status) == 200) {
          console.log('\nSuccess');
        } else {
          console.log('\nCheck something:');
        }
        console.log('Here is the response form server:');
        console.log(JSON.stringify(body));
        process.exit(0);
      } else {
        console.log('\nHave error(s): ' + error + '. resCode: ' + response.statusCode);
        process.exit(1);
      }
    });
  }
}, {
  name: 'preview',
  describe: 'config your apikey',
  require: [{
    name: 'pathOfMd',
    position: 1,
    require: true
  }, {
    name: 'saveTo',
    position: 2,
    require: true
  }],
  action: function(agru) {
    apiUrl += '/preview';

    agru.pathOfMd = path.isAbsolute(agru.pathOfMd) ? agru.pathOfMd : path.resolve(process.cwd(), agru.pathOfMd);
    try {
      fs.accessSync(agru.pathOfMd, fs.F_OK);
    } catch (e) {
      console.log(cliString.error.pathNeed);
      process.exit(1);
    }
    agru.saveTo = path.isAbsolute(agru.saveTo) ? agru.saveTo : path.resolve(process.cwd(), agru.saveTo);

    let content = fs.readFileSync(agru.pathOfMd, 'utf8');

    let data = {
      content: content
    }

    request({
      method: 'POST',
      uri: apiUrl,
      headers: {
        'Accept-Charset': 'application/json',
        'X-Kipalog-Token': config.key
      },
      json: data
    }, function(error, response, body) {
      if (response.statusCode == 406) {
        console.log('\nInvalid API key');
        process.exit(1);
      }
      if (!error && response.statusCode != 404) {
        if (body && body.content) {
          fs.writeFileSync(agru.saveTo, body.content);
          body.content = "Saved as " + agru.saveTo;
        }
        console.log('\nHere is the response form server:');
        console.log(JSON.stringify(body));
        process.exit(0);
      } else {
        console.log('\nHave error(s): ' + error + '. resCode: ' + response.statusCode);
        process.exit(1);
      }
    });


  }
}, {
  name: 'config',
  alias: 'c',
  describe: 'config your apikey',
  require: [{
    name: 'apiKey',
    position: 1,
    require: false
  }],
  action: function(agru) {
    let key = agru.apiKey;
    if (key) {
      if (key == 'delete') {
        config.deleteKey();
        console.log('Deleted api key');
        process.exit(0);
      }
      config.write(key);
      console.log(cliString.success.addKey, key);
    } else {
      console.log(cliString.sayHi.addKey);
      addKey();
    }
  }
}, {
  name: 'get',
  alias: 'g',
  describe: 'config your apikey',
  require: [],
  options: [{
    name: 'hot',
    require: false
  }, {
    name: 'tagby',
    alias: 'tb',
    require: false
  }, {
    name: 'new',
    alias: 'n',
    require: false
  }, {
    name: 'path',
    require: false
  }],
  action: function(agru) {
    if ('hot' in agru || 'tagby' in agru || 'new' in agru) {

      let pathF = agru.path;

      if (pathF) {
        pathF = path.isAbsolute(pathF) ? pathF : path.resolve(process.cwd(), pathF);
        delete agru.path;
      }

      if (Object.keys(agru).length >= 2) {
        console.log('\nOnly one option for command. Hot or tagby or new.');
        process.exit(1);
      }

      if (Object.keys(agru).length <= 2) {

        let method = 'GET';
        let data = {};

        if ('hot' in agru) {
          apiUrl += '/hot';
          if (!pathF) pathF = Date.now() + '-kipalog-hot.json';
        }

        if ('tagby' in agru) {
          apiUrl += '/bytag';
          method = 'POST';
          if (!pathF) pathF = Date.now() + '-kipalog-tagby-' + agru.tagby + '.json';
          data = {
            "tag_name": agru.tagby
          };
        }

        if ('new' in agru) {
          apiUrl += '/newest';
          if (!pathF) pathF = Date.now() + '-kipalog-new.json';
        }

        request({
          method: method,
          uri: apiUrl,
          headers: {
            'Accept-Charset': 'application/json',
            'X-Kipalog-Token': config.key
          },
          json: data
        }, function(error, response, body) {

          if (response.statusCode == 406) {
            console.log('\nInvalid API key');
            process.exit(1);
          }
          if (!error && response.statusCode != 404) {
            if (body && body.content) {
              console.log('\nSuccess');
              fs.writeFileSync(pathF, JSON.stringify(body));
              body.content = "Saved as " + pathF;
            }
            console.log('\nHere is the response form server:');
            console.log(JSON.stringify(body));
            process.exit(0);
          } else {
            console.log('\nHave error(s): ' + error + '. resCode: ' + response.statusCode);
            process.exit(1);
          }

        });

      }

    } else {
      console.log('\nWe need at least 1 option. Hot or tagby or new.');
      process.exit(1);
    }
  }
}];

let options = [{
  name: 'help',
  alias: 'h',
  action: function() {
    showHelp();
  }
}, {
  name: 'version',
  alias: 'v',
  action: function() {
    console.log('Kipalog CLI version 0.0.1');
  }
}];

;

function addKey() {
  co(function*() {
    key = yield prompt('\nYour api key: ');
    if (!key) {
      console.log(cliString.sayHi.addKeyAgain);
      addKey();
    } else {
      config.write(key);
      console.log(cliString.success.addKey, key);
      process.exit(0);
    }
  });
}

function showHelp() {
  console.log(cliString.sayHi.headHelp +
    '\n\nCommands:' +
    '\n\n\r Config API Key:' +
    '\n\r     kipalog config <your-api-key>' +
    '\n\r or  kipalog config' +
    '\n\r or  kipalog config delete' +
    '\n\n\r Upload your post:' +
    '\n\r     kipalog post <path.md> --title "Hello" --tag "til, nodejs" [--public true]' +
    '\n\r or  kipalog post <path.md> -t "Hello" --tag "til, nodejs" [-p true]' +
    '\n\r or  kipalog post --tag "til, nodejs" -t "Hello" [-p false] <path.md>' +
    '\n\r   dont care about option\'s position, you can move anywhere' +
    '\n\n\r Preview your post:' +
    '\n\r     kipalog preview <path.md> <save-as-path.html>' +
    '\n\n\r Get posts:' +
    '\n\r     kipalog get --hot [--path "path-save-response.json"]' +
    '\n\r     kipalog get --new [--path "path-save-response.json"]' +
    '\n\r or  kipalog get --bytag <tag> [--path "path-save-response.json"]' +
    '\n\r   default of path is <currently directory>/timestamp-optionName.json' +
    '\n\nOptions:' +
    '\n\r     kipalog --help' +
    '\n\r or  kipalog -h' +
    '\n\r     kipalog --version' +
    '\n\r or  kipalog -v'
  );

}

module.exports = function() {
  hCli.setArgv(argv).commands(commands).options(options).help('help').run(key, cliString.sayHi.notyet)
};
