class Notify {

    notify(content) {
        const div = document.createElement('div')
        div.className='notify'
        div.textContent = content
        div.style.position = 'fixed'
        div.style.right = 0
        div.style.padding = '10px'
        div.style.margin = '10px'
        div.style.border = '1px solid #eeee'
        window.document.body.append(div)

        setTimeout(() => {
            document.body.removeChild(div)
        }, 3000)
    }
}

window.AstrolabePlan.register('Notify', Notify)
