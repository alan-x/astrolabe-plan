import axios from 'axios'

class Http {
    static get(url, params) {
        return axios.get(url, params)
    }

    static post(url, params) {
        return axios.post(url, params)
    }
}

export default Http
