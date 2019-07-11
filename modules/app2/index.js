class App2 {
    constructor(notify) {
        this.notify = notify
    }

    render(ele) {
        this.notify.notify('我是 app2')
        ele.innerHTML=`app2`
    }
}

window.AstrolabePlan.register('App2', App2, ['Notify'])
