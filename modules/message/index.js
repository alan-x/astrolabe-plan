class Message {
    constructor() {
        this.messageMap = {}
    }

    register(name, callback) {
        if (!this.messageMap.hasOwnProperty(name)) {
            this.messageMap[name] = []
        }
        this.messageMap[name].push(callback)
    }

    run(name, data) {
        const callbackList = this.messageMap[name]
        if (callbackList && callbackList.length) {
            callbackList.forEach((callback) => {
                callback(data)
            })
        }
    }

    getMessage(name) {
        return (data) => this.run(name, data)
    }
}

window.AstrolabePlan.register('Message', Message)
