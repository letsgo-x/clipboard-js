#!/usr/bin/env node

const { name, version } = require('./package')
const name2 = removeSuffix(name, '-js')

const download = require("download")
const fs = require('fs')
const path = require('path')

const host = 'http://npmmirror.eyou.net'
const platform = getPlatform()
const arch = process.env.npm_config_arch || process.arch

function removeSuffix(str, suffix) {
  if (str.endsWith(suffix)) {
    return str.slice(0, str.length - suffix.length)
  }
  return str;
}

// windows 32 和 64 都会返回 win32
function getPlatform() {
  let platform = process.env.npm_config_platform || process.platform
  if (platform === 'win32') {
    return 'win'
  }
  return platform
}

function isInstalled() {
  let ext = '.dll'

  if (platform === 'darwin') {
    ext = '.dylib'
  }
  if (platform === 'linux') {
    ext = '.so'
  }

  try {
    return fs.existsSync(path.join(__dirname, 'bin', 'libclipboard' + ext));
  } catch (e) {
    return false
  }
}

if (isInstalled()) {
  console.log('libclipboard has been installed and will be updated binary dependence for you')
  // process.exit(0);
}

console.log(name, version, name2, arch)
return

// 定义下载链接
// /clipboard/v1.0.0/clipboard-v1.0.0-win-x86.tar.gz
const url = host + '/' + name + '/v' + version + '/' + name + '-v' + version + '-' + platform + '-' + arch + '.tar.gz';

(async () => {
  let binary_dir = path.join(__dirname, 'bin')
  await download(url, binary_dir, { extract: true })

  // 暂时不支持 win32
  if (platform === 'win32') {
    console.log('currently not supporting win32!')
    process.exit(0)
  }

  console.log('library download successful!')
})()
