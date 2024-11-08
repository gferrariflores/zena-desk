const { defineConfig } = require('@vue/cli-service')

/*
module.exports = defineConfig({
  transpileDependencies: true
})
*/

module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        appId: 'com.pastaszena.zenadesk',
        productName: 'ZenaDesk',
        win: {
          target: 'nsis',
        },
        mac: {
          target: 'dmg',
        },
        linux: {
          target: 'AppImage',
        }
      }
    }
  }
}