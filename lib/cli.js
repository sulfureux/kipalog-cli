"use strict";
import printf from 'printf';

Array.prototype.diff = function(a) {
  return this.filter(function(i) {
    return a.indexOf(i) < 0;
  });
};

class PieCli {
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
    let argv = this.argv[0];
    let command = this.cmds.filter(function(e) {
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
    let reg = /(--|-)(.*)/i;
    if (reg.test(this.argv[0])) {
      let nameOfOption = reg.exec(this.argv[0])[2];
      return nameOfOption;
    } else {
      return false;
    }
  }

  runOption(name) {
    let option = this.opts.filter(function(e) {
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
    let reg = /^(--|-)(.*)/i;
    return reg.test(opt);
  }

  clearMinus(name) {
    return name.replace(/-+/, '');
  }

  run(haveAKey, notyetString) {
    if (this.argv.length == 0 && !haveAKey) return;

    let isFirstOptionlet = this.isFirstOption();
    let isCommandlet = this.isCommand();

    if (!isFirstOptionlet && !isCommandVar) {

      console.log("\nkipalog: " + this.argv + " is not a kipalog command. See 'kipalog --help': \n");
      this.runOption(this.nameOfHelp);

    } else {

      if (isFirstOptionVar) {
        if (!this.runOption(isFirstOptionVar)) {
          console.log("\nkipalog: " + isFirstOptionlet + " is not a kipalog option. See 'kipalog --help': \n");
          this.runOption(this.nameOfHelp);
        }
      }

      if (isCommandVar) {

        isCommandlet = isCommandVar[0];

        if (!haveAKey && isCommandVar.name != 'config') {
          console.log(notyetString);
          process.exit(1);
        }

        let errors = [];
        let error = '\nYou forgot adding %s option, Please check it';
        let errorRequire = '\nYou forgot adding %s require, Please check it';

        let listOption = {};
        let isOption = this.isOption;
        let argv = this.argv.slice(1);
        let argv2 = [];
        let clearMinus = this.clearMinus;

        this.argv.forEach(function(e, index) {
          if (isOption(e)) {
            let nextE = argv[index];
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

exports = module.exports = new PieCli();
