# 在 Electron 中结合 SQLCipher

> sqlcipher是sqlite的扩展，它对sqlite进行数据加密，保证了数据安全。

一般情况下从SQLite3添加扩展必须要经过重新编译，对于c++外行来说有点棘手，所以在这里我是采用安装 @journeyapps/sqlcipher 包。

> Github地址：[https://github.com/journeyapps/node-sqlcipher](https://github.com/journeyapps/node-sqlcipher)

## 必要环境组件

在项目开始之前，

**windows 10**

必须安装 Visual Studio 2015 和 Python 2.7 。*注意：Python 必须是 2.7，不能是 3 以上版本。在安装 Visual Studio 时记得安装上 win 10 SDK，保证在 electron-rebuild 时不会报错。*

## QUICK START

```
$ git clone https://github.com/zcorw/electron-sqlcipher.git
$ cd electron-sqlcipher
$ npm i
$ npm run rebuild
```

如果执行没有报错，此时你就可以在 Electron 中使用 SQLCipher。

