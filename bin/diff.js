#!/usr/bin/env node

const chalk = require('chalk')
const chokidar = require('chokidar')
const diff = require('jest-diff')
const fs = require('fs')
const path = require('path')
const minimist = require('minimist')
const mkdirp = require('mkdirp')
const readlineSync = require('readline-sync')

const {
  NO_DIFF_MESSAGE, 
  SIMILAR_MESSAGE
} = require('jest-diff/build/constants');

const argv = minimist(process.argv.slice(2))

const DIR_NAME = '__snog__'
const outDir = path.join(process.cwd(), DIR_NAME)
const latestDir = path.join(outDir, 'latest')
const refDir = path.join(outDir, 'ref')

const opts = {
  watch: argv.w || argv.watch
}

if (opts.watch) {
  const watcher = chokidar.watch(latestDir, {
    ignored: /^\./,
    persistent: true
  })

  watcher
    .on('add', f => check(path.basename(f)))
    .on('change', f => check(path.basename(f)))
    .on('error', err => console.error(err))

  console.log(chalk.dim('watching ' + latestDir + ' for changes...'))
}
else {
  oneoff()
}

function promptForUpdate (f, latest) {
  const updateRef = readlineSync.keyInYN('Update ref?')
  if (updateRef) {
    fs.writeFileSync(path.join(refDir, f), latest)
    console.log(chalk.dim('...updated\n'))
  }
  else {
    console.log(chalk.dim('no change\n'))
  }
}

function check (f) {
  const latest = fs.readFileSync(path.join(latestDir, f), 'utf8')
  let ref

  try {
    ref = fs.readFileSync(path.join(refDir, f), 'utf8')
  }
  catch (e) {
    // no ref file
    console.log('no ref for', f)
    console.log(chalk.green(latest))
    promptForUpdate(f, latest)
    return
  }

  console.log(f)
  const result = diff(
    { value: JSON.parse(latest) },
    { value: JSON.parse(ref) }
  )

  if (result !== NO_DIFF_MESSAGE) {
    console.log(result)
    promptForUpdate(f, latest)
  }
  else {
    console.log(result)
  }
}

function oneoff () {
  fs.readdir(latestDir, (err, files) => {
    if (err) throw err

    files.forEach(check)
  })

  // TODO: check for unchecked refs
}
