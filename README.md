astrolabe-plan 星盘计划-微前端架构🌰
---
### 简单架构

在项目的一开始，我们通常使用最简单的方式启动项目（当然得益于现在各种脚手架和活跃的社区，这么开始的人不多了），以一个登陆页面栗子，实现可能如下：
```
class App extends React.Component {
    state = {
        account: undefined,
        password: undefined
    }

    handleLoginClick = async () => {
        const {account, password} = this.state

        try {
            this.setState({loading: true})
            const userInfo = await axios.post('api/login', {account, password})
            sessionStorage.setItem('USER_INFO', {userInfo})
            window.location.href = 'index'
        } catch (e) {
            alert(e.message)
        } finally {
            this.setState({loading: false})
        }
    }

    handleChange = (state) => {
        this.setState(state)
    }

    render() {
        const {account, password} = this.state
        return (
            <Spin spining={loading} className="App">
                <div>
                    <label htmlFor="account">
                        <input type="text" name="account" value={account}
                               onChange={({target: {value: account}}) => this.handleChange({account})}/>
                        />
                    </label>
                </div>

                <div>
                    <label htmlFor="password">
                        <input type="password" name="password" value={password}
                               onChange={({target: {value: password}}) => this.handleChange({password})}/>
                    </label>
                </div>
                <div>
                    <button onClick={this.handleLoginClick}>登陆</button>
                </div>
            </Spin>
        );
    }
}

export default App;
```
业务说明：
1. 用户输入账户和密码，然后点击确认
2. 用户点击确认之后弹出`loading`，然后请求`api/login`接口登陆。
3. 如果登陆成功，就保存用户数据到本地`sessionStorage`，并跳转`index`首页
4. 如果登陆失败，就提示失败原因
5. 不管成功还是失败，都隐藏`loading`

架构图：

![视图](https://assets.processon.com/chart_image/5d20b587e4b0fdb331d51585.png)

业务很简单，但是却涉及到许多不同种类的调用，包括
1. 事件处理
2. 状态绑定
3. 网络请求
4. 数据存储

### 单体架构
对于以上架构我们可以做如下优化：
- 提取视图无关的逻辑到服务
```
// service/UserService.js
class UserService {
    login() {
        return new Promise((resolve, reject) => {
            axios.post('api/login')
                .then((res) => {
                    sessionStorage.setItem('USER_INFO', JSON.stringify(res))
                    resolve(res)
                }).catch(e => reject(e))
        })
    }
}
```
而视图层便可改为如下：
```
// view/LoginPage.js
    constructor(props) {
        super(props)
        this.userService = new UserService()
    }
    handleLoginClick = async () => {
        const {account, password} = this.state

        try {
            this.setState({loading: true})
            await this.userService.login({account, password})
            window.location.href = 'index'
        } catch (e) {
            alert(e.message)
        } finally {
            this.setState({loading: false})
        }
    }
```
这样的好处是视图层并不需要知道登陆的细节，只需要知道登陆的输入和产出
在`UserService`中依旧存在一些问题，比如网络调用，有时候我们需要对网络请求做统一的封装，所以网路请求需要提取出来：
```
// utils/Http.js
class Http {
    get(url, params) {
        return axios.get(url, params)
    }

    post(url, params) {
        return axios.post(url, params)
    }
}
```
`UserService`中做如下修改：
```
// service/UserService.js
class UserService {
    constructor() {
        this.http = new Http()
    }

    login() {
        return new Promise((resolve, reject) => {
            this.http.post(URL_LOGIN)
                .then((res) => {
                    sessionStorage.setItem('USER_INFO', JSON.stringify(res))
                    resolve(res)
                }).catch(e => reject(e))
        })
    }
}
```
这样做的好处是完全屏蔽了网络请求的细节，比如特殊的头部处理之类，并且抽象为`HTTP`公共操作，当需要更换网络库，或者修改网络库具体实现的时候，只要保持接口一致，将不会对上层产生任何影响。
但是依旧存在问题，比如依赖了具体接口地址`api/login`，如果接口多了将不利于统一管理，并且多个地方调用的接口地址更换可能导致重复修改和维护困难，所以继续优化：
```
// config/api.js
export const URL_LOGIN='api/login'
```
`UserService`做如下修改：
```
// service/UserService.js
class UserService {
    constructor() {
        this.storage = new Storage('USER_INFO')
        this.http = new Http()
    }

    login() {
        return new Promise((resolve, reject) => {
            this.http.post(URL_LOGIN)
                .then((res) => {
                    this.storage.set(res)
                    resolve(res)
                }).catch(e => reject(e))
        })
    }
}
```
`UserService`还存在一个问题，那就是依赖了`sessionStorage`具体操作，并且还有指定的`KEY`和必要的`JSON.stringify`调用，我们继续封装：
```
// storage/Storage.js
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
```
`UserService`做如下修改：
```
// service/UserService.js
class UserService {
    constructor() {
        this.storage = new Storage('USER_INFO')
        this.http = new Http()
    }

    login() {
        return new Promise((resolve, reject) => {
            this.http.post(URL_LOGIN)
                .then((res) => {
                    this.storage.set(res)
                    resolve(res)
                }).catch(e => reject(e))
        })
    }
}
```

此时的架构图：
![视图、服务、工具、配置、存储](https://assets.processon.com/chart_image/5d20c385e4b0878e40a7e941.png)

### 垂直单体架构

到了这个阶段以后，基本上就可以发展一段时间了。而随着业务的增加，单体架构的问题就渐渐的出现了，越来越庞大的项目让开发调试、部署成本都逐渐增加，于是就根据业务做垂直拆分，比如订单模块、用户模块、运营模块。
![垂直单体](https://assets.processon.com/chart_image/5d2175f7e4b0d16653f71a79.png)

由于各个模块是独立的，所以可以划分到独立项目、独立的团队单独开发维护，同时可以横向拓展，能够解决因为业务增长单体项目爆炸的问题。

但是业务的增长依旧在继续，虽然可以通过垂直单体项目的横向扩展来达到快速满足业务的目的，但是如何组织多个单体项目成了一个问题：
1. 一个单体项目一个iframe
2. 将所有的单体项目通过一个项目来管理


### 插拔式架构
第一种方案在现在单页面成为趋势的情况下是绝对不推荐的，虽然这是旧时代普遍的做法，但是单页面重复的大资源加载成本是无法忍受的。

而第二种方案便是所谓的插拔式架构，通过一个项目作为主项目，根据路由切分不同应用。以菜单为入口，在各个单页面应用之间跳转。
此时的架构：
![插拔式架构](https://assets.processon.com/chart_image/5d217820e4b0fdb331d5441a.png)




看似解决了一些问题，但其实也带来了一些问题
1. 垂直架构本身不过是多个单体项目的简单聚合，而不同单体应用的项目结构和层次必定存在相似的代码，比如网络层，而随着单体项目各自的发展，将会出现相似却不兼容的代码，为维护埋下巨大的隐患。
2. 重复的资源重复打包也是一大成本。

### 微服务架构-星盘计划

其实插拔式架构已经就是今年比较热门的微前端概念了，但是在我看来，这不过是形而上的微前端，就像之前说的，垂直架不过是多个单体架构的耦合。各自的工具层、配置层、存储层都是独立存在的，基础设置基本无共享。各个项目各自发展，看似和谐，却糟糕的很，比如项目A的服务层依赖项目A的网络工具实现，而项目B的服务层依赖项目B的网络实现，如果项目A和B的网路工具实现有所差异，项目A和项目B的服务就无法共享。


![微服务](https://assets.processon.com/chart_image/5d21cc80e4b0b807972a16c0.png)

具体原因就是将模块的划分定义在应用级别，即一个应用或者一系列的页面才是一个模块，无论是开发还是部署，都是以应用为最小单位进行，无法摆脱用路由来区分应用的思想桎梏，陷入了形而上的微服务思想。因此，我决定将模块的细分级别，降低，极端的情况下可以将一个函数都可以视为一个模块，独立开发，独立部署。就像运行时的`npm`仓库，任何模块的更新都可以立马生效，用户甚至不需要刷新网页，毕竟每个模块都在`Ioc`池中，替换就行了（当前正在被使用的模块会不会崩溃呢？）。

我将前端微服务分为8大基础模块：
- 星盘-IOC模块：支持动态加载`js`，管理依赖、服务、和`IOC`注入的模块，是联系所有模块的基本模块
- 消息模块：和 RabbitMQ 等消息队列一致的作用，接受消息推送，消息来源可以是网络请求的副作用，也可以是后段推送的通知，也可以是各个模块之间的通知，负责在各个模块、前后端之间传输信息
- 路由模块：监听路由变化，切换当前的应用模块
- 应用模块：真实的业务模块，配合路由模块，负责和用户交互
- 通知模块：统计的通知中心，其中包括公告、错误提示等，提供统一的接口，是应用模块的一个特例。
- 配置模块：统一的配置中心，所有的应用的配置都走这里，配合消息模块，接收后端通知，可以做到运行时更新配置
- 存储模块：localstorage、sessionStorage、内存存储的统一接口
- 网络模块：网络请求统一处理

### 微服务基本盘-Ioc模块
让我们分析一下单体应用登陆的栗子，该栗子一共有4个模块：
- 登陆页面模块：`Login.js`
- 用户服务模块：`UserService.js`
- 存储模块：`Storage.js`
- 网络模块：`Http.js`
其模块依赖如下：
![模块依赖](https://assets.processon.com/chart_image/5d21d959e4b0b807972a1d94.png)

虽然层次拆分的很好，但是存在一个致命性的问题，那就是依赖太严重，登陆模块依赖用户服务模块，用户服务模块依赖存储和网络模块，可以举两个场景来说明问题：
- 打包需要将所有的模块都打包，每一次修改都是一样的，部署也是，一次部署，影响所有依赖模块
- 依赖具体文件和路径，如果有一天需要更换某一个模块，同时保留原始模块，比如`HTTP`，需要修改所有依赖该模块的路径，因为我们是以`import xx`的形式引入依赖的
- 而如果是垂直架构模式或者插拔式架构，则存在模块无法共享的问题，的确一些模块可以通过封装nom包的形式共享，但是一旦更新，就需要打包所有涉及到的应用，一段时间之后就会出现版本差异。

那如何解决呢？
最简单的方式就是不依赖具体实现，而是通过注入。而注入最简单的方式就是注入到`window`中，比如将`Http`模块注入到`window`中：
```
window.Http = Http
```
这样在`UserService`就可以直接通过`window.Http.post`来访问，但是这太不优雅了，对于全局空间的污染完全就是一种退化。所以可以稍微换一种思路，我们依旧注入到`window`中，但是只注入到`window`中的一个变量上，这个变量可以称之为依赖池、服务池。具体的实现，则可以使用`Ioc`：

`Ioc`使用说明
- `Ioc.constructor(config:Array<Module>):Ioc`：构造器
    - 参数：
        - `config:Array<Module>`，模块的配置文件，
    - 返回值：`Ioc`实例
- `Ioc.prototype.register(name:String, constructor:Function, dependencies:Attry<String>):Ioc`：注册模块
    - 参数：
        - `name:String`：要注册的模块名称
        - `constructor:Function`：模块构造函数
        - `dependencies:Array<String>`：依赖的模块名称
    - 返回值：`Ioc`实例，可用于链式调用
- `Ioc.prototype.run(name: String)：Object`：运行某个模块
    - 参数：
        - `name:String`：要运行的模块
    - 返回值：模块的实例

- `Module` 属性说明：
    - `name`：模块名，
    - `path`：地址，用于动态加载
    - `instance`：模块实例
    - `constr`：模块构造器
    - `loaded`：模块是否加载

`Ioc`维护一个依赖池，将系统中的所有依赖挂载到依赖池中，需要的时候可以从中提取和实例化。
 
使用栗子：
- 编写模块`b`， 并注册：
```
class B {
    getName() {
        return 'b'
    }
}

AstrolabePlan.register('b', B)
```
- 编写模块`a`，模块`a`依赖模块`b`并注册：
```
class A {
    constructor(b) {
        this.b = b
    }

    sayHello() {
        console.log(`hello ${this.b.getName()}`)
    }
}

AstrolabePlan.register('a', A, ['b'])
```
- 实例化`Ioc`并启动模块`a`：
```
window.AstrolabePlan = new Ioc([{
        name: 'a',
        path: 'a.js'
    }, {
        name: 'b',
        path: 'b.js'
    }])
window.AstrolabePlan.run('a')
    .then(a => {
        a.sayHello()
    })
```
使用`ioc`有两个特点：
- 不依赖具体实现：所有的依赖都是声明式，不依赖具体实现和文件，不需要打包到依赖该模块的其他模块中。例如模块`A`依赖模块`B`，但是却不需要知道`B`在哪儿，如何实现的，只需要知道`B`在构造中可以获得引用。

- 模块级动态更新：受益于不依赖具体实现的特点，所有的模块都可以动态加载的，而动态加载的地址是写在配置中的，这意味着，我们可以将这些配置文件存储在服务端，并在用户访问的时候输入到页面。也就是说我们可以通过修改动态加载地址来达到模块的更新，甚至可以接收服务端推动，来实时更新配置信息，从而让用户不刷新就能热更新功能。比如模块`A`依赖模块`B`，我们可以通过修改模块`B`的`path`属性来更新`B`，从而达到更新依赖的目的，这期间模块`A`是不需要重新打包的。

`Ioc`还有一个优点：
- 面向接口的编程方式：可以让每一个公共模块的接口设计都非常规范，并且可控。

`Ioc`视万物为模块，不管是网络请求、页面、存储，都是一样，所以用它来奠定微服务的基本盘。虽然在单体架构中也可以实现，但是说实在的单体项目对`Ioc`的依赖并不大，但是在微服务，不依赖具体实现的特点让模块独立部署成为现实，也让微服务真正体现出了它的威力。

### Ioc 栗子
以`UserSerivce`和`Http`为栗子，我们可以做如下改造
```
class UserService {
    constructor(http) {
        this.storage = new Storage('USER_INFO')
        this.http = http
    }

    login() {
        return new Promise((resolve, reject) => {
            this.http.post(URL_LOGIN)
                .then((res) => {
                    this.storage.set(res)
                    resolve(res)
                }).catch(e => reject(e))
        })
    }
}

window.AstrolabePlan.register('UserSerivce', UserSerivce, ['Http'])
```
而`Http`可以做如下改造
```
class Http {
    get(url, params) {
        return axios.get(url, params)
    }

    post(url, params) {
        return axios.post(url, params)
    }
}
AstrolabePlan.register('Http', Http)
```
在构建`Ioc`中可以这么定义：
```
window.AstrolabePlan = new Ioc([{
        name: 'UserService',
        path: 'UserService.js'
    }, {
        name: 'Http',
        path: 'Http.js'
    }])
```
在`UserService`并没有对`Http`有任何文件依赖，而这两个模块通过配置中的`path`来动态加载的，也是说我们可以通过更新`Http`模块的`path`来更新`Http`模块，比如，我们新增一个`delete`方法到`Http`中：
```
    delete(url, params) {
        return axios.delete(url, params)
    }
```
然后打包为`Http.v2.js`，那我们就可以通过修改`Http`模块的`path`为`Http.v2.js`就达到了更新`Http`模块的目的，非常轻量的更新。并且前端如果何以接收配置的更新通知，甚至可以在用户的下一次调用就修复`Http`产生的`bug`。

### Ioc 在插拔式架构中的使用

如前文所述，插拔式架构不过是垂直架构的变形，本质上每个应用都是单体架构的本质没有发生变化。所以，一个单体架构的构成也依旧不变。依旧以登陆页栗子来说，由视图层、服务层、存储层构成，而服务层依赖于网络工具的实现。如果将网络工具层替换为`Ioc`注入呢？会发生什么？因为并不依赖具体的实现，单体项目本身也不需要打包和网络工具相关的类，比如`Http`，那么就可以将所有单体项目的`Http`工具剥落，形成独立的`Http`模块，肩负和后端交互的职责。有独立的开发和部署周期。那么就能防止各个单体项目的`Http`层各自发展、版本差异、重复编码了。

同理，由于服务层可以不依赖具体的网络层，而依赖网络层规范接口，其可用性大大增加。也可以独立模块，提供给其他所有模块使用

同理，所有的服务、工具都可以用这种方法，而不是像插拔式架构那般依赖于整个应用。

可以这么说，使用`Ioc`之后的项目就是一个运行时的`npm`，模块的负责人负责开发并部署自己的模块，同时也依赖别人的模块。


### 注入一个模块

- 新建 App 模块作为入口模块
```javascript
// modules/app/index.js
class App {
    constructor() {
        console.log('app start')
    }

}
window.AstrolabePlan.register('App', App)
```
- 新建入口并配置 App 为启动模块
```javascript
window.AstrolabePlan = new Ioc(window.moduleConfig)
window.AstrolabePlan.run('App')
```
- 新建模版文件并引入 Ioc 模块和 App 模块
```html
<!doctype html>
<html lang="cn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Astrolabe Plan</title>
    <script>
        window.moduleConfig = [{
            name: 'App',
            path: './modules/app/index.js',
        }]
    </script>
</head>
<body>
<div id="app"></div>
</body>
<script src="./modules/ioc/index.js"></script>
<script src="index.js"></script>
</html>
```
- 启动浏览器，查看控制台，便可以看到输出
```
> app start
```

### 应用模块
应用模块不是一个模块，而是一整个系列的模块。它代表的是一系列的业务和页面，是各种模块的主要调度者。

在这里，和插拔式架构类似，我们依旧可以以一个应用模块作为所有模块的基本盘，毕竟登陆、鉴权、路由管理等功能依旧要在一个模块上实现会比较好。

所以我们将上面的`App`模块转化成所有应用模块的入口，这里将页面上的`app`元素作为应用模块的挂载点：

```javascript
class App {
    constructor() {
        this.start()
    }

    start() {
        const app = document.getElementById('app')
        app.innerHTML = `这是app入口`
    }
}

window.AstrolabePlan.register('App', App)
```
打开浏览器，就可以看见页面上显示`这是app入口`这几个字啦。

### 路由模块
我们通常会以入口应用为基本盘，在上面挂载多个应用，然后通过路由匹配不同的模块，而其中路由匹配则用到了路由模块，这里可以实现一个超级简单的，并使用该路由模块实现应用的切换
- 路由模块
这里只是一个简单的对`location.pushState`做一个监听
```javascript
class Router {
    constructor() {
        this.listenerList = []
    }

    register(callback) {
        this.listenerList.push(callback)
    }

    push(path) {
        window.history.pushState('', '', path)
        this.listenerList.forEach(listener => {
            listener(path)
        })
    }

}

window.AstrolabePlan.register('Router', Router)
```
- 应用模块 App1
```javascript
// modules/app1/index.js
class App1 {
    constructor() {
    }

    render(ele){
        ele.innerHTML=`app1`
    }
}

window.AstrolabePlan.register('App1', App1)
```
- 应用模块 App2
```javascript
// modules/app2/index.js
class App2 {
    constructor() {
    }

    render(ele){
        ele.innerHTML=`app2`
    }
}

window.AstrolabePlan.register('App2', App2)
```
- 应用模块入口 `App`
这里实现了一个菜单，点击菜单调用`router.push`触发路由改变，调用不同应用模块的`render`方法渲染页面，达到跳转页面的目的。
```javascript
class App {
    constructor(router, notify, app1, app2) {
        this.router = router
        this.app1 = app1
        this.app2 = app2
        this.start()
        this.router.register(this.listenRouterChange.bind(this))
        this.router.init()
    }

    listenRouterChange(path) {
        const map = {
            app1: this.app1,
            app2: this.app2
        }
        map[path].render(document.getElementById('content'))
    }

    start() {
        const app = document.getElementById('app')
        app.innerHTML = `<ul id="menu">
                            <li><a data-app="app1">app1</a></li>
                            <li><a data-app="app2">app2</a></li>
                        </ul>
                        <div id="content">
                        </div>
                        `
        const menu = document.getElementById('menu')
        menu.onclick = (e) => {
            const app = e.target.getAttribute('data-app')
            this.router.push(app)
        }
    }
}

window.AstrolabePlan.register('App', App, ['Router', 'Notify', 'App1', 'App2'])
```

### 通知模块
通知模块是一个组件模块，它提供全局的通知接口，比如`alert`、`notify`、浏览器通知等。这里我们只实现简单的通知。

- 通知模块
通知模块很简单，会在右上角提示一些内容
```javascript
class Notify {

    notify(content) {
        const div = document.createElement('div')
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
```
- 网络失败的时候提示用户
这个在我看来超级优雅的，解耦的非常彻底。
```javascript
// 注册 Http 监听器
        this.http.register(this.listenHttpResponse.bind(this))
// 如果返回数据的 code 是 error，就调用通知模块通知用户 
    listenHttpResponse({code, message: {content}}) {
        if (code === 'error') {
            this.notify.notify(content)
        }
    }
```

### 网络模块
在前端应用中，网络模块非常重要，因为前端的大部分行为都在通过网络和后段打交道。所以构建一个完善的网络模块也是势在必行的。而网络模块其实包含很多。这里主要包含两个，一个是完成业务的`Http`模块，一个是作为消息推送的的`websocket`长链接。但对于规范来说，这两则其实部分可以通用

### API 接口设计

- http 状态码
只使用 200 和 500 作为主要状态码，两百表示请求成功，500表示请求失败。

- http 方法
使用简单的get和复杂的post，简单的get就是，${host}?${queryString}，下面都是`post`接口说明

- content-type 
只使用 application/json; charset=utf8

- body 格式
```
{
    "data":{ 
        // 发送数据
    },
    "timestamp": 1432424324,
    "nonce": "sdfsdf",
    "sign": "sfsfsdfafa",
}
```
    - data：存放要发送的数据
    - timestamp：时间戳
    - nonce：无意义字符串，和`timestamp`用来防重放攻击
    - sign：根据数据data、timestamp、nonce生成的签名校验，验证参数是否被篡改，防止简单的数据伪造。

- 返回值格式：
```
{
    "code":"success",
    "message":"",
    "data":{

    },
    "timestamp":14324234234,
    "nonce":"sdfsfsdf",
    "sign":"sdfsfsdfs"
}
```
    - code：业务码，字符串，和使用数字不同，字符串具有可读性，不需要查表，比如`username_or_password_error`。同时具有良好的拓展性，不易冲突。并且和消息模块结合，`code`可以成为一个队列名。
    - message：字符串或者对象，如果是空串将被忽略，如果是字符串和对象处理方案不同，在下面会详细说明
    - data: 返回的数据，务必是对象，防止后期因为扩展导致的接口不兼容，比如原本返回数组，但是增加了分页，导致接口和之前不兼容，前端必须修改的情况，血泪教训！
    - timestamp：时间戳
    - nonce：无意义字符串
    - sign：根据数据data、timestamp、nonce生成的签名校验，验证参数是否被篡改，防止简单的数据伪造。

code 说明：
code 本身代表业务的状态，比如，success表示业务成功，api.password.or.account.error 表示业务失败，api.account.forbidden 表示账户被禁用。

同时，我们可以制定几个全局的 code，表明这是所有接口都会出现的：
- success：表示业务成功，无任何疑问
- api.failure：表明业务失败，具体看提示
- api.no.permission：表明无权限操作
- api.offline：表明登陆过期，需要重新登陆

- message 说明
在日常和后段的交互中，我们最常见的操作是后端返回成功后提示一段文本给用户。比如调用登陆接口之后提示用户登陆成功并跳转。
与其在前端编写这些重复的代码，不如直接将这些场景暴露给后段，设计如下场景：
- 调用接口之后提示一段文本：
```
"message":{
    type:'success',
    content:'登陆成功'
}
// 或者
"message": "登陆成功"
```
- 调用之后提示失败：
```
"message":{
    type:'error',
    content:'登陆成功'
}
// 或者
"message": "登陆成功"
```
- 调用之后提示失败：
```
"message":{
    type:'error',
    content:'账户或者密码错误'
}
```
- 调用之后除了提示外，跳转
```
"message":{
    type:'success',
    content:'登陆成功',
    redirect'index',
    target:'_blank'
}
```
- 调用之后提示框通知：
```
"message":{
    type:'alert',
    content:'登陆成功'
}
```
- 调用之后确认框通知：
```
"message":{
    type:'confirm',
    content:'登陆成功',
    redirect'index',
    target:'_blank'
}
```
- 调用之后执行脚本：
```
"message":{
    "type":"script",
    "content":"()=>{alert('登陆成功')}",
}
```
- 网络模块实现栗子
```
class Http {
    constructor() {
        this.hooks = []
        axios.interceptors.response.use((response) => {
            this.hooks.forEach(hook => {
                hook(response.data)
            })
            return response.data;
        }, () => {
            const response = {
                code: 'error',
                message: {
                    type: 'error',
                    content: '网络错误'
                },
                data: {}
            }
            this.hooks.forEach(hook => {
                hook(response)
            })
            return response
        });
    }

    get(url, params) {
        return this.send('get', url, params,)
    }

    post(url, data) {
       return this.send('post', url, data)
    }

    send(method, url, data) {
        return new Promise((resolve, reject) => {
            axios({
                method,
                url,
                params: method === "get" ? data : undefined,
                data: method === "post" ? data : undefined,
                timestamp: Date.now(),
                nonce: '',
                sign: ''
            }).then(({code, data}) => {
                if (data.code !== 'success') {
                    resolve(data)
                } else {
                    const error = new Error()
                    error.code = code
                    error.data = data
                    reject(error)
                }
            })
        })
    }
}
```
这里的设计很巧妙：
- 在响应拦截器中，我们在成功的时候，剥去了`response`的外衣，直接把`data`拿出来了，因此在`get`和`post`的`then`中，我们可以直接访问到`code`和`data`，而不需要再进行一层结构。
- 在响应拦截器中，我们在失败的时候，不会reject这个请求，而是依旧返回一个符合`api`规范的`body`。我们将在下面的栗子中举例
- 拦截器是一个数组，我们可以随时增加拦截器。

Q: 为什么我们要用拦截器，并开放给外部，
A：一般情况下，这里会直接注入一个`Toas`弹窗，但是这样就涉及到页面处理，而这个模块是一个普通的模块，不应该依赖任何视图框架或者`Dom`操作，所以将依赖倒转。这样不局限于弹窗提示。比如我们可以注册一个拦截器，将`response`全部导向消息模块，然后通知模块订阅此类消息，从而达到通知用户，而视图和功能解耦。


Q：为什么在错误的时候依旧返回一个符合`api`规范的的`body`呢？
A：一个`promise`只有两种状态，我们在`get`和`post`中以`code`为条件，设计了`resolve`和`reject`两个流程，而`reject`传入两个参数：`code`和`data`，如果这里不构造一个相同的结构，在对`code`的判断会产生错误，比如:
```
try{
    await this.userService.login({accout,password})
}catch(e){
    switch(e.code):{
        case "api.user.forbidden": {
            //...
        }
        case "": {
            //
        }
    }
} finally {
    //
}
```
如果这个是一个错误，那就糟糕了。同时为了将数据导向消息模块，构造这么一个也是需要的。一石二鸟

### 消息模块

模块间交流的需求也是必不可少的，比如，角色的切换导致整个模块状态的变化，虽然可以使用发布、订阅模式来完整事件的通知，但是不够优雅。

所以这里引入消息队列的思想，将所有系统内发生的、需要通知其他模块的事件都以消息的模式发放，而对于需要的模块，可以各自发送消息或者订阅消息，而对于消息的种类，可以分为两种：
1. 责任链：根据订阅消息的顺序传播，中间可以中断。
2. 广播型：所有订阅者都收得到

场景一：后段推送

后段推送新的消息到前端，比如添加好友通知、系统公告、状态变更等，相应的模块可以订阅相关的消息，并作出响应

场景二：模块间通信

网络错误的时候，通知模块弹出消息提示

也就是说，一切需要松耦合的地方，都可以走消息队列。


实现
```javascript
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
```
很简单的发布/订阅者模式


### 配置模块

所有的应用的配置都放置在这里，链接消息模块，接收后段通知，可以动态更新配置，实时响应系统变化，甚至可以在服务端配置网络接口。

这个模块很简单，只是将暴露在 window 上的配置用统一的接口规范，使之不粗暴的直接调用 window

```javascript
class Config {
    getModuleConfig() {
        return window.moduleConfig
    }
}

window.AstrolabePlan.register('Config', Config)
```

### 存储模块
统一的存储接口，配合配置模块，配置化存储引擎。

比如这里可以支持`localStorage`和`sessionStorage`，甚至还可以支持内存存储、远程存储、indexDB存储等。

并且还可以添加监听器。

```javascript
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

window.AstrolabePlan.register('Storage', Storage)
```

### 总结
微服务让整个前端项目真正的活起来了，而不是旋转木马，或者堆积木。
