const clipboard = require('./index.js')

// node v16.x 会有偶发致命错误，错误来自于 ffi-napi
// node v18.x 貌似没有问题了

// clipboard.writeText('你好棒')
// console.log('CT_TEXT:', clipboard.readText())
//
// clipboard.writeHTML('<p>世界</p>')
// console.log('CT_HTML:', clipboard.readHTML())
//
// // 复制路径到剪切板中，复制后就可以粘贴了
// clipboard.writePaths('/Users/admin/Pictures/003235-171069315532ac.jpeg;/Users/admin/Pictures/报纸墙 长卷发 大波浪 可爱动漫美女壁纸_彼岸壁纸.jpg')
// console.log('CT_PATHS:', clipboard.readPaths())
//
// clipboard.writeRAWD(Buffer.from('hello rawd666!'))
// console.log('CT_RAWD:', clipboard.readRAWD().toString())

clipboard.writeMany({
  text: '你好1',
  html: '<p style="color: red;">世界1</p>',
  rawd: Buffer.from('hello rawd666!'),
})

console.log('CT_TEXT:', clipboard.readText())
console.log('CT_HTML:', clipboard.readHTML())
console.log('CT_RAWD:', clipboard.readRAWD().toString())


// // 复制图片到剪切板中
// const fs = require('node:fs')
// const path = require('node:path')
// const imagePath = path.join(__dirname, 'example_output.png')
// const data = fs.readFileSync(imagePath)
// clipboard.writeImage(data)

// const imageBuffer = clipboard.readImage()
// fs.writeFileSync('./example_output2.png', imageBuffer)

console.log(666.111, '当前剪贴板序列号', clipboard.getSequenceNumber())

const platform = process.env.npm_config_platform || process.platform
if (platform !== 'linux') {
  return
}

const sleep = (ms) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

// linux 需要保证进程活着，这是 x11 决定的
// linux 只有进程一直存活，才能监控剪切板变化并计数序列号
const start = async () => {
  for (let idx = 0;; idx++) {
    await sleep(1000)
    console.log(idx)
    console.log(666.111, '当前剪贴板序列号', clipboard.getSequenceNumber())

    // // 5s 后退出
    // if (idx > 5) {
    //   break
    // }
  }
}
start()
