# Kipalog CLI

Command Line Tool based on Nodejs for Kipalog

# Installation

Install with npm:

```bash
$ npm i -g kipalog-cli
```
[https://www.npmjs.com/package/kipalog-cli](https://www.npmjs.com/package/kipalog-cli)

# Usage
## First time, config your API Key for using this CLI
```bash
$ kipalog config
```
or you can add with command: `$ kipalog config <your-api-key>`

If you want to change your API key. Set it again with:
`$ kipalog config` or `$ kipalog config <your-api-key>`

Delete your API Key setting:
```bash
$ kipalog delete
```

This CLI use for:

http://kipalog.com

https://github.com/Kipalog/Kipalog-API-Doc

### How to get that API:
[Kipalog API Doc#Prepare](https://github.com/Kipalog/Kipalog-API-Doc#prepare)


## Upload your post
### Write your post in a Markdown file.
Example: `README.md`
And open your BASH or CMD or anything you can command.
Remember your path of `README.md` or just need `cd` to the folder containing this file.
```bash
$ kipalog post README.md --title "Hello world" --tag "TIL, Nodejs, CSS" --public true
```
or you can run for draft:
```bash
$ kipalog post README.md --title "Hello world" --tag "TIL, Nodejs, CSS"
```
dont forget, if your path of file has any space, wrap it with '' or "".
Example: `"READ ME.md"`

#### Option of `kipalog post` command
| option | | value | desciption |
|---|---|---|---|
|--title or -t | requried | `string` | title of your post |
|--tag | requried | `string` | list of tag, split by comma |
|--public or -p | option | `boolean` | publish your post or not (defalut: `false`) |

*Notice*: each option is followed by its value, example: `--title "title of post"` .

## Preview your post

```bash
$ kipalog preview <your-post-path.md> <path-file-will-save-as.html>
```
Example:

```bash
$ kipalog preview readme.md readme.html
```

## Get post from Kipalog
**Default**: If you dont give path to save file. File will be saved in where you command. Filename default is: `timestamp-kipalog-optionname[-tag].json`

### Hot
Get 30 recent hot post
```bash
$ kipalog get --hot [--path=<path-save-response.json>]
```

### Newest
Get 30 recent newest post
```bash
$ kipalog get --new [--path=<path-save-response.json>]
```

### Newest
Get 30 recent post by tag.
```bash
$ kipalog get --tagby <tagname> [--path=<path-save-response.json>]
```

## Orther options

```bash
$ kipalog --help
$ kipalog -h
$ kipalog --version
$ kipalog -v
```
# Copyright and license
Copyright 2016 - 2017 Pierre Neter. Released under the MIT license.
