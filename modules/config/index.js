class Config {
    getModuleConfig() {
        return window.moduleConfig
    }

    getPageModule() {
        return window.moduleConfig.filter(({type}) => type === 'page')
            .map((module) => ({
                [module.router]: module
            })).reduce((o1, o2) => ({...o1, ...o2}), {})
    }
}

window.AstrolabePlan.register('Config', Config)
