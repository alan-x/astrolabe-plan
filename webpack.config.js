const path = require('path')
module.exports = {
    mode: 'development',
    entry: {
        index: path.resolve(__dirname, 'index.js'),
        app: path.resolve(__dirname, 'modules/app/index.js'),
        app1: path.resolve(__dirname, 'modules/app1/index.js'),
        app2: path.resolve(__dirname, 'modules/app2/index.js'),
        config: path.resolve(__dirname, 'modules/config/index.js'),
        http: path.resolve(__dirname, 'modules/http/index.js'),
        message: path.resolve(__dirname, 'modules/message/index.js'),
        notify: path.resolve(__dirname, 'modules/notify/index.js'),
        router: path.resolve(__dirname, 'modules/router/index.js'),
        storage: path.resolve(__dirname, 'modules/storage/index.js'),
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: '[name].js'
    },
    module: {
        rules: [{
            test: /\.js$/,
            loader: 'babel-loader'
        }]
    }
}
