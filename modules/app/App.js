import React from 'react'

class App extends React.Component {

    contentRef = React.createRef()

    componentDidMount() {
        const {router} = this.props
        router.register(this.listenRouterChange.bind(this))
    }

    handleClick = (path) => {
        const {router} = this.props
        router.push(path)
    }

    listenRouterChange(path) {
        const {config, ioc}=this.props
        const module = config.getPageModule()[path]
        ioc.loadModule(module)
            .then((m) => {
                const constr = m.constr
                new constr(ioc.getModuleInstances(...m.dependencies)).render(this.contentRef.current)
            })
    }

    render() {
        return <div>
            <ul>
                {
                    ['app1', 'app2'].map((path) => {
                        return <li><a onClick={() => this.handleClick(path)}>app1</a></li>
                    })
                }
            </ul>
            <div id="content" ref={this.contentRef}>

            </div>
        </div>
    }
}

export default App
