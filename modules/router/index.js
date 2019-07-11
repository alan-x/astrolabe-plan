class Router {
    constructor() {
        this.listenerList = []
    }

    register(callback) {
        this.listenerList.push(callback)
    }

    push(path) {
        window.history.pushState('', '', path)
        this.listenerList.forEach(listener => {
            listener(path)
        })
    }

}

window.AstrolabePlan.register('Router', Router)
