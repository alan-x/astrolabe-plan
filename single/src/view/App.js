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

class App extends React.Component {
    state = {
        account: undefined,
        password: undefined,
        loading: false,
    }

    handleLoginClick = async () => {
        const {account, password} = this.state

        try {
            this.setState({loading: true})
            const userInfo = await (new UserService()).login({account, password})
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

export default App;
