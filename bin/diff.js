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
  const watcher = chokidar.watch(`${latestDir}/**/*.txt`, {
    ignored: /^\./,
    persistent: true
  })

  watcher
    .on('add', f => check(f))
    .on('change', f => check(f))
    .on('error', err => console.error(err))

  console.log(chalk.dim('watching ' + latestDir + ' for changes...'))
}
else {
  oneoff()
}

function getSrcLines (caller) {
  return fs.readFileSync(caller.file, 'utf-8').split(/[\r\n]/)
}

function formatSrcLines (rawLines, lineNum) {
  const SURROUNDING = 1
  const startLineNum = Math.max(lineNum - SURROUNDING, 1)
  const endLineNum = Math.min(lineNum + SURROUNDING, rawLines.length)

  const lines = []
  for (var i=startLineNum; i<=endLineNum; i+=1) {
    var color = i === lineNum ? 'white' : 'dim'
    lines.push(chalk[color](`${i}:\t${rawLines[i-1]}`))
  }
  return lines.join('\n')
}

function promptForUpdate (f, latest) {
  const updateRef = readlineSync.keyInYN('Update ref?')
  const destFile = path.join(refDir, f)
  if (updateRef) {
    mkdirp.sync(path.dirname(destFile))
    fs.writeFileSync(destFile, latest)
    console.log(chalk.dim('...updated\n'))
  }
  else {
    console.log(chalk.dim('no change\n'))
  }
}

function check (f) {
  const relFilename = f.substr(latestDir.length + 1)
  const latest = fs.readFileSync(f, 'utf8')
  let ref

  let srcLines
  let meta
  try {
    meta = JSON.parse(fs.readFileSync(f.replace(/\.txt$/, '.json')))
    srcLines = getSrcLines(meta.caller)
  } catch (e) {
    console.error(e)
  }

  console.log('\n' + chalk.bgBlack(relFilename))

  if (meta) {
    console.log(formatSrcLines(srcLines, meta.caller.line))
  }

  try {
    ref = fs.readFileSync(path.join(refDir, relFilename), 'utf8')
  }
  catch (e) {
    // no ref file
    console.log('no ref for', relFilename)
    console.log(chalk.green(latest))
    promptForUpdate(relFilename, latest)
    return
  }

  const result = diff(
    { value: JSON.parse(ref) },
    { value: JSON.parse(latest) }
  )

  if (result !== NO_DIFF_MESSAGE) {
    console.log(result)
    promptForUpdate(relFilename, latest)
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
