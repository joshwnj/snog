const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const prettyFormat = require('pretty-format')


const DIR_NAME = '__snog__'
const outDir = path.join(process.cwd(), DIR_NAME)
const latestDir = path.join(outDir, 'latest')
const refDir = path.join(outDir, 'ref')

mkdirp.sync(outDir)
mkdirp.sync(latestDir)
mkdirp.sync(refDir)

function snog (label, info) {
  const filename = label + '.txt'
  const metadata = {
    ts: Date.now(),
    label: label,
    stack: (new Error).stack
  }
  // TODO: store metadata separately

  // TODO: use pretty-format, but need to preserve types
  const content = JSON.stringify(info, null, 2)
  fs.writeFile(path.join(latestDir, filename), content, (err) => {
    if (err) {
      console.error(err)
    }
  })
}

module.exports = snog
