class Storage {
    constructor(name) {
        this.name = name
    }

    set(data) {
        sessionStorage.setItem(this.name, JSON.stringify(data))
    }

    get() {
        return JSON.parse(sessionStorage.getItem(this.name))
    }
}

export default Storage
