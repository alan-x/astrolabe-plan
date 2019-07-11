import React from 'react'
import ReactDOM from 'react-dom'
import App from "./App";

class Index {
    constructor(ioc, /*http,*/ router, notify, config) {
        this.router = router
        this.notify = notify
        this.config = config
        this.ioc = ioc
        this.start()
        // this.http = http
        // this.http.register(this.listenHttpResponse.bind(this))
    }

    listenHttpResponse({code, message: {content}}) {
        if (code === 'error') {
            this.notify.notify(content)
        }
    }

    start() {
        const app = document.getElementById('app')
        ReactDOM.render(<App
            router={this.router}
            config={this.config}
            ioc={this.ioc}
        />, app)
    }
}

window.AstrolabePlan.register('App', Index, ['Ioc',/*'Http',*/ 'Router', 'Notify', 'Config'])
