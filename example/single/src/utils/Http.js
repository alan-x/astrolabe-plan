import axios from 'axios'

class Http {
    get(url, params) {
        return axios.get(url, params)
    }

    post(url, params) {
        return axios.post(url, params)
    }

    delete(url, params) {
        return axios.delete(url, params)
    }
}

export default Http
