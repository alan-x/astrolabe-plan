import axios from 'axios';

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

    register(callback) {
        this.hooks.push(callback)
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

window.AstrolabePlan.register('Http', Http)
