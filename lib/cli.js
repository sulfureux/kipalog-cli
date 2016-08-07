"use strict";
var printf = require('printf');

Array.prototype.diff = function(a) {
  return this.filter(function(i) {
    return a.indexOf(i) < 0;
  });
};

class HalcyonLCli {
  constructor() {
    this.optionsOfCommand = [];
  }
  setArgv(argv) {
    this.argv = argv;
    return this;
  }
  commands(cmds) {
    this.cmds = cmds;
    return this;
  }
  options(opts) {
    this.opts = opts;
    return this;
  }
  help(help) {
    this.nameOfHelp = help;
    return this;
  }
  isCommand() {
    if (!this.argv && !this.cmds) throw console.log('Please add argv');
    var argv = this.argv[0];
    var command = this.cmds.filter(function(e) {
      return e.name == argv || e.alias == argv
    });
    if (command.length > 0) {
      return command;
    } else {
      return false;
    }
  }

  isFirstOption() {
    if (!this.argv) throw console.log('Please add argv');
    var reg = /(--|-)(.*)/i;
    if (reg.test(this.argv[0])) {
      var nameOfOption = reg.exec(this.argv[0])[2];
      return nameOfOption;
    } else {
      return false;
    }
  }

  runOption(name) {
    var option = this.opts.filter(function(e) {
      return e.name == name || e.alias == name
    });
    if (option.length != 0) {
      option[0].action();
      return true;
    } else {
      return false;
    }
  }

  isOption(opt) {
    var reg = /^(--|-)(.*)/i;
    return reg.test(opt);
  }

  clearMinus(name) {
    return name.replace(/-+/, '');
  }

  run(haveAKey, notyetString) {
    if (this.argv.length == 0 && !haveAKey) return;

    var isFirstOptionVar = this.isFirstOption();
    var isCommandVar = this.isCommand();

    if (!isFirstOptionVar && !isCommandVar) {

      console.log("\nkipalog: " + this.argv + " is not a kipalog command. See 'kipalog --help': \n");
      this.runOption(this.nameOfHelp);

    } else {

      if (isFirstOptionVar) {
        if (!this.runOption(isFirstOptionVar)) {
          console.log("\nkipalog: " + isFirstOptionVar + " is not a kipalog option. See 'kipalog --help': \n");
          this.runOption(this.nameOfHelp);
        }
      }

      if (isCommandVar) {

        isCommandVar = isCommandVar[0];

        if (!haveAKey && isCommandVar.name != 'config') {
          console.log(notyetString);
          process.exit(1);
        }

        var errors = [];
        var error = '\nYou forgot adding %s option, Please check it';
        var errorRequire = '\nYou forgot adding %s require, Please check it';

        var listOption = {};
        var isOption = this.isOption;
        var argv = this.argv.slice(1);
        var argv2 = [];
        var clearMinus = this.clearMinus;

        this.argv.forEach(function(e, index) {
          if (isOption(e)) {
            var nextE = argv[index];
            listOption[clearMinus(e)] = !isOption(nextE) ? nextE : undefined;

            if (listOption[clearMinus(e)] == nextE) {
              argv2.push(e);
              argv2.push(nextE);
            }
          }
        });

        argv2 = argv.diff(argv2);

        if (isCommandVar.require) {

          isCommandVar.require.forEach(function(e, index) {

            if (!argv2[e.position - 1]) {
              if (e.require) {
                errors.push(printf(errorRequire, e.name));
              }
            } else {
              listOption[e.name] = argv2[e.position - 1];
            }

          });
        }

        if (isCommandVar.options) {

          isCommandVar.options.forEach(function(e, index) {

            if (listOption[e.name] || listOption[e.alias]) {
              listOption[e.name] = listOption[e.name] || listOption[e.alias];
            } else {
              if (e.require) {
                errors.push(printf(error, e.name));
              }
            }

          });

        }

        if (errors.length > 0) {
          errors.forEach(function(e) {
            console.log(e);
          });
          process.exit(1);
        }

        isCommandVar.action(listOption);

      }


      //end command.

    }

  }
}

exports = module.exports = new HalcyonLCli();
