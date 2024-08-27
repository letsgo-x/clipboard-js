# clipboard-js
目前支持 windows macos linux，仅编译了 x64 的，因为 linux 是在 uos 上编译的，所以 glibc 太低可能不能用

## ffi bug
> https://github.com/nodejs/node/issues/32463
> 
> https://github.com/node-ffi-napi/node-ffi-napi/issues/71

macos + node_16.x 目测有问题，node_18.x 没事，但是 node_18.x 依赖高版本的 glibc，centos7 用不了
