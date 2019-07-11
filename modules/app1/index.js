class App1 {
    constructor(notify) {
        this.notify = notify
    }

    render(ele) {
        this.notify.notify('我是 app1')
        ele.innerHTML = `app1`
    }
}

window.AstrolabePlan.register('App1', App1, ['Notify'])
