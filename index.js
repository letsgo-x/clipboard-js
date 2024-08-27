const ffi = require('ffi-napi')
const ref = require('ref-napi')

// 简化定义 C 的类型
const CInt = ref.types.int
const CString = ref.types.CString
const charPtr = ref.refType(ref.types.char)
const intPtr = ref.refType(ref.types.int)

const platform = process.env.npm_config_platform || process.platform

let ext = '.dll'
if (platform === 'darwin') {
  ext = '.dylib'
} else if (platform === 'linux') {
  ext = '.so'
}

// TODO: 修改动态库的扩展名
const clipboardLib = ffi.Library('./bin/libclipboard' + ext, {
  'FreeCharMem': ['void', [charPtr]],
  'ClipboardSequenceNumber': ['int', []],

  'ClipboardReadText': [charPtr, []],
  'ClipboardReadHTML': [charPtr, []],
  'ClipboardReadRAWD': ['void', [charPtr, intPtr]],
  'ClipboardReadPaths': [charPtr, []],
  'ClipboardReadImage': ['void', [charPtr, intPtr]],

  'ClipboardWrite': ['void', [CString]],
  'ClipboardWriteText': ['void', [CString]],
  'ClipboardWriteHTML': ['void', [CString]],
  'ClipboardWriteRAWD': ['void', [charPtr, CInt]],
  'ClipboardWritePaths': ['void', [CString]],
  'ClipboardWriteImage': ['void', [charPtr, CInt]],
})

// writeMany 只支持同时设置三种类型 text、html、rawd
// rawd 可作为 html 的隐藏类型，不过如果都用本库，就对本库无隐藏效果了
// rawd 当前把二进制变成字节码，然后编码成 json 传递了，这会导致体积会上升不少（writeRAWD 无此问题）
// TODO: rawd 改为 base64 再编码进 json，这样体积只会有限上升
const writeMany = (dataMap) => {
  try {
    const supportedTypes = ['text', 'html', 'rawd']
    for (const typ in dataMap) {
      if (!supportedTypes.includes(typ)) {
        delete dataMap[typ]
      }

      if (typ === 'rawd') {
        if (!(dataMap[typ] instanceof Buffer)) {
          delete dataMap[typ]
        } else {
          // 变成 Uint8 数字后再编码成 json 体积会变大很多
          dataMap[typ] = Array.from(new Uint8Array(dataMap[typ]))
          // dataMap[typ] = dataMap[typ].toString('base64')
        }
      } else {
        if (typeof dataMap[typ] !== 'string') {
          delete dataMap[typ]
        }
      }
    }

    // 单次同时写入多种类型
    clipboardLib.ClipboardWrite(JSON.stringify(dataMap))
  } catch (e) {
    console.log(e)
  }
}

const writeText = (text) => {
  try {
    clipboardLib.ClipboardWriteText(text)
  } catch (e) {
    console.log(e)
  }
}

const writeHTML = (html) => {
  try {
    clipboardLib.ClipboardWriteHTML(html)
  } catch (e) {
    console.log(e)
  }
}

const writePaths = (paths) => {
  try {
    // TODO: 是否验证路径存在
    //       是否对 paths 格式有要求
    clipboardLib.ClipboardWritePaths(paths)
  } catch (e) {
    console.log(e)
  }
}

const writeImage = (imageBuffer) => {
  try {
    if (imageBuffer instanceof Buffer) {
      clipboardLib.ClipboardWriteImage(imageBuffer, imageBuffer.length)
    }
  } catch (e) {
    console.log(e)
  }
}

const writeRAWD = (dataBuffer) => {
  try {
    if (dataBuffer instanceof Buffer) {
      clipboardLib.ClipboardWriteRAWD(dataBuffer, dataBuffer.length)
    }
  } catch (e) {
    console.log(e)
  }
}

const readText = () => {
  try {
    const resultPtr = clipboardLib.ClipboardReadText()
    const text = ref.readCString(resultPtr)
    // 释放内存
    clipboardLib.FreeCharMem(resultPtr)

    return text
  } catch (e) {
    console.log(e)
  }
}

const readHTML = () => {
  try {
    const resultPtr = clipboardLib.ClipboardReadHTML()
    const html = ref.readCString(resultPtr)
    // 释放内存
    clipboardLib.FreeCharMem(resultPtr)

    return html
  } catch (e) {
    console.log(e)
  }
}

const readPaths = () => {
  try {
    const resultPtr = clipboardLib.ClipboardReadPaths()
    const paths = ref.readCString(resultPtr)
    // 释放内存
    clipboardLib.FreeCharMem(resultPtr)

    return paths
  } catch (e) {
    console.log(e)
  }
}

const readImage = () => {
  try {
    const dataPtrPtr = ref.alloc(charPtr)
    const lengthPtr = ref.alloc(ref.types.int)

    // 调用 C 函数获取数据
    clipboardLib.ClipboardReadImage(dataPtrPtr, lengthPtr)
    const buf = Buffer.from(ref.reinterpret(dataPtrPtr.deref(), lengthPtr.deref()))

    // 释放 C 中的内存
    clipboardLib.FreeCharMem(dataPtrPtr.deref())

    return buf
  } catch (e) {
    console.log(e)
  }
}

const readRAWD = () => {
  try {
    const dataPtrPtr = ref.alloc(charPtr)
    const lengthPtr = ref.alloc(ref.types.int)

    // 调用 C 函数获取数据
    clipboardLib.ClipboardReadRAWD(dataPtrPtr, lengthPtr)
    const buf = Buffer.from(ref.reinterpret(dataPtrPtr.deref(), lengthPtr.deref()))

    // 释放 C 中的内存
    clipboardLib.FreeCharMem(dataPtrPtr.deref())

    return buf
  } catch (e) {
    console.log(e)
  }
}

module.exports = {
  getSequenceNumber: () => {
    // 在 linux 中每次进程重启会从零重新计数
    // 此方法同于监控剪贴板变化的，当两次 sn 不同时可以认为被修改了
    return clipboardLib.ClipboardSequenceNumber()
  },

  readText,
  readHTML,
  readPaths,
  readImage,
  readRAWD,

  writeMany,
  writeText,
  writeHTML,
  writePaths,
  writeImage,
  writeRAWD,
}
