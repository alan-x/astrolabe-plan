import React from 'react';
import UserService from "../service/UserService";

class Spin extends React.Component {
    render() {
        const {children} = this.props
        return <div>
            {children}
        </div>
    }
}

class LoginPage extends React.Component {
    state = {
        account: undefined,
        password: undefined,
        loading: false,
    }

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

    handleChange = (state) => {
        this.setState(state)
    }

    render() {
        const {account, password, loading} = this.state
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

export default LoginPage;
