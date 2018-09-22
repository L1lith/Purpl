const express = require('express')
const mkdirp = require('mkdirp')
const {join} = require('path')
const {access} = require('fs-extra')

async function createServer(directory) {
  const app = express()
  const cacheDir = join(directory, 'cache')
  mkdirp(cacheDir)
  app.use(express.static(cacheDir))

  let serverHookPath = null
  try {
    await access(join(directory, 'server.js'))
    serverHookPath = join(directory, 'server.js')
  } catch(err) {
    try {
      await access(join(directory, 'server/index.js'))
      serverHookPath = join(directory, 'server/index.js')
    } catch(err) {}
  }
  if (serverHookPath) {
    let serverHook = require(serverHookPath)
    if (typeof serverHook != 'function') throw new Error("Server Hook Must Export a Function!")
    serverHook(app)
  }

  return app
}

module.exports = createServer