const callsites = require('callsites')
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const prettyFormat = require('pretty-format')

const DIR_NAME = '__snog__'
const outDir = path.join(process.cwd(), DIR_NAME)
const latestDir = path.join(outDir, 'latest')
const refDir = path.join(outDir, 'ref')

const rootDir = process.cwd()

mkdirp.sync(outDir)
mkdirp.sync(latestDir)
mkdirp.sync(refDir)

function generateLabel (caller) {
  return `${caller.getFunctionName()}-${caller.getLineNumber()}`
}

function getRootRelative (rootDir, dir) {
  return dir.indexOf(rootDir) === 0 ?
    dir.substr(rootDir.length) :
    dir
}

function snog (info) {
  const cs = callsites()
  const caller = cs[1]
  const label = generateLabel(caller)
  const dir = caller.getFileName()
  const relDir = getRootRelative(rootDir, dir)

  const filename = label + '.txt'
  const metadata = {
    ts: Date.now(),
    caller: {
      'file': caller.getFileName(),
      'line': caller.getLineNumber(),
      'function': caller.getFunctionName()
    }
  }
  // TODO: store metadata separately

  // TODO: use pretty-format, but need to preserve types
  const content = JSON.stringify(info, null, 2)
  const destDir = path.join(latestDir, relDir)
  mkdirp(destDir, (err) => {
    if (err) {
      console.error(err)
      return
    }

    fs.writeFile(path.join(destDir, filename), content, (err) => {
      if (err) {
        return console.error(err)
      }

      fs.writeFile(path.join(destDir, filename.replace(/\.txt$/, '.json')), JSON.stringify(metadata), (err) => {
        if (err) {
          return console.error(err)
        }
      })
    })
  })
}

module.exports = snog
