class Storage {
    getStorage(type, key) {
        this.key = key
        if (type === 'LOCAL_STORAGE') {
            this.storage = localStorage
        } else if (type === 'SESSION_STORAGE') {
            this.storage = sessionStorage
        } else {
            throw new Error(`not support this storage: ${type}`)
        }
    }

    set(data) {
        this.storage.set(this.key, JSON.stringify(data))
    }

    get() {
        return JSON.stringify(this.storage.get(this.key))
    }
}

window.AstrolabePlan.register('Router', Router)
