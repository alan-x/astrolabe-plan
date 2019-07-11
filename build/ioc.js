/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./modules/ioc/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./modules/ioc/index.js":
/*!******************************!*\
  !*** ./modules/ioc/index.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("class Module {\n    constructor({name, path, dependencies = []}) {\n        this.name = name\n        this.path = path\n        this.dependencies = dependencies\n        this.instance = undefined\n        this.constr = undefined\n        this.loaded = false\n    }\n}\n\nclass Ioc {\n    constructor(modules = []) {\n        this.modules = modules\n            .map(mc => ({[mc.name]: new Module(mc)}))\n            .reduce((o1, o2) => ({...o1, ...o2}), {})\n        const ioc = new Module({name: 'Ioc', path: '/'})\n        ioc.loaded = true\n        ioc.instance = this\n        ioc.constr = Ioc\n        this.modules['Ioc'] = ioc\n    }\n\n    register(name, constr, dependencies) {\n        if (this.modules.hasOwnProperty(name) && this.modules[name].loaded)\n            throw new Error(`[${name}] has already exit, change service name and try again.`)\n        this.modules[name].constr = constr\n        this.modules[name].dependencies = dependencies\n        this.modules[name].loaded = true\n    }\n\n    getModuleInstances(moduleNames = []) {\n        const modules = this.getModules(moduleNames)\n        if (Array.isArray(modules)) {\n            return moduleNames.map(name => this.modules[name].instance)\n        } else if (typeof modules === \"object\") {\n            return modules.instance\n        }\n    }\n\n    getModules(moduleNames = []) {\n        if (typeof moduleNames === \"string\") {\n            const module = this.modules[moduleNames]\n            if (!module) {\n                throw new Error(`module [${module}] does not exit, please check it out!`)\n            }\n            return module\n        } else if (Array.isArray(moduleNames)) {\n            return moduleNames.map(name => this.modules[name])\n        } else {\n            throw new Error(`error type of moduleNames`)\n        }\n    }\n\n    run(name) {\n        const module = this.modules[name]\n        return new Promise((resolve, reject) => {\n            this.loadModule(module)\n                .then(() => {\n                    resolve(module.instance)\n                })\n                .catch(e => reject(e))\n        })\n\n    }\n\n    /**\n     * 加载依赖\n     * @param {Module} module\n     * @returns {Promise<Module>}\n     */\n    loadModule(module) {\n        return new Promise((resolve, reject) => {\n\n            const action = () => {\n                const updateModule = this.getModules(module.name)\n                const constr = updateModule.constr\n                updateModule.instance = new constr(...this.getModuleInstances(module.dependencies))\n                resolve(updateModule)\n            }\n            this.loadJS(module)\n                .then(() => {\n                    const unloadModule = this.getModules(module.dependencies).filter(({loaded}) => !loaded)\n                    if (!unloadModule.length) {\n                        action()\n                    }\n\n                    Promise.all(unloadModule.map((module) => this.loadModule(module)))\n                        .then(modules => {\n                            modules.forEach((module) => {\n                                const constr = module.constr\n                                module.instance = new constr(...this.getModuleInstances(module.dependencies))\n                            })\n                            action()\n                        }).catch(e => reject(e))\n                })\n        })\n    }\n\n    /**\n     * 加载 js 文件\n     * @param {Module} module\n     * @returns {Promise<Module>}\n     */\n    loadJS(module) {\n        return new Promise((resolve, reject) => {\n            const script = document.createElement('script')\n            script.type = 'text/javascript'\n            script.onload = () => resolve(module)\n            script.onerror = () => reject(module)\n            script.src = module.path\n            document.body.appendChild(script)\n        })\n    }\n}\n\n\n//# sourceURL=webpack:///./modules/ioc/index.js?");

/***/ })

/******/ });