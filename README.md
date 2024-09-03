# clipboard-js
目前支持 windows macos linux

> windows 支持 x64 和 ia32
> 
> macos、linux 支持 x64 和 arm64

> macos
> 
> x64 在 12.6.2 兼容编译 11.0
> 
> arm64 在 14.0 兼容编译 11.0



## 附录1：
> **ffi bug 导致无法在 node_16.x 及以下版本使用，macos + node_16.x 下有问题**
> 
> https://github.com/nodejs/node/issues/32463
> 
> https://github.com/node-ffi-napi/node-ffi-napi/issues/71

node_18.x 没事，但是 node_18.x 依赖更高版本的 glibc，好像在 centos7 下默认得 glibc2.17 用不了
