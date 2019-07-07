import Http from "../utils/Http";
import {URL_LOGIN} from "../config/api";
import Storage from "../storage/Storage";

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

export default UserService
