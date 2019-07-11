class Module {
    constructor({name, path, dependencies = []}) {
        this.name = name
        this.path = path
        this.dependencies = dependencies
        this.instance = undefined
        this.constr = undefined
        this.loaded = false
    }
}

class Ioc {
    constructor(modules = []) {
        this.modules = modules
            .map(mc => ({[mc.name]: new Module(mc)}))
            .reduce((o1, o2) => ({...o1, ...o2}), {})
        const ioc = new Module({name: 'Ioc', path: '/'})
        ioc.loaded = true
        ioc.instance = this
        ioc.constr = Ioc
        this.modules['Ioc'] = ioc
    }

    register(name, constr, dependencies) {
        if (this.modules.hasOwnProperty(name) && this.modules[name].loaded)
            throw new Error(`[${name}] has already exit, change service name and try again.`)
        this.modules[name].constr = constr
        this.modules[name].dependencies = dependencies
        this.modules[name].loaded = true
    }

    getModuleInstances(moduleNames = []) {
        const modules = this.getModules(moduleNames)
        if (Array.isArray(modules)) {
            return moduleNames.map(name => this.modules[name].instance)
        } else if (typeof modules === "object") {
            return modules.instance
        }
    }

    getModules(moduleNames = []) {
        if (typeof moduleNames === "string") {
            const module = this.modules[moduleNames]
            if (!module) {
                throw new Error(`module [${module}] does not exit, please check it out!`)
            }
            return module
        } else if (Array.isArray(moduleNames)) {
            return moduleNames.map(name => this.modules[name])
        } else {
            throw new Error(`error type of moduleNames`)
        }
    }

    run(name) {
        const module = this.modules[name]
        return new Promise((resolve, reject) => {
            this.loadModule(module)
                .then(() => {
                    resolve(module.instance)
                })
                .catch(e => reject(e))
        })

    }

    /**
     * 加载依赖
     * @param {Module} module
     * @returns {Promise<Module>}
     */
    loadModule(module) {
        return new Promise((resolve, reject) => {

            const action = () => {
                const updateModule = this.getModules(module.name)
                const constr = updateModule.constr
                updateModule.instance = new constr(...this.getModuleInstances(module.dependencies))
                resolve(updateModule)
            }
            this.loadJS(module)
                .then(() => {
                    const unloadModule = this.getModules(module.dependencies).filter(({loaded}) => !loaded)
                    if (!unloadModule.length) {
                        action()
                    }

                    Promise.all(unloadModule.map((module) => this.loadModule(module)))
                        .then(modules => {
                            modules.forEach((module) => {
                                const constr = module.constr
                                module.instance = new constr(...this.getModuleInstances(module.dependencies))
                            })
                            action()
                        }).catch(e => reject(e))
                })
        })
    }

    /**
     * 加载 js 文件
     * @param {Module} module
     * @returns {Promise<Module>}
     */
    loadJS(module) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.type = 'text/javascript'
            script.onload = () => resolve(module)
            script.onerror = () => reject(module)
            script.src = module.path
            document.body.appendChild(script)
        })
    }
}

export default Ioc
