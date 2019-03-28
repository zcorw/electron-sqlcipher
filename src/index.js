import React, { Component } from "react";
import ReactDOM from "react-dom";
import { ipcRenderer } from "electron";

class Hello extends Component {
    constructor() {
        super();
        this.state = {
            users: [],
            text: "",
        }
    }
    componentDidMount() {
        ipcRenderer.send("get")
        ipcRenderer.on("users", (events, users) => {
            this.setState({ users })
        })
    }
    submit() {
        this.setState({ users: this.state.users.concat([{name: ipcRenderer.sendSync("add", this.state.text)}]) });
    }
    textChange(e) {
        this.setState({ text: e.target.value });
    }
    render() {
        return (
            <React.Fragment>
                <Input submit={this.submit.bind(this)} onChange={this.textChange.bind(this)} />
                <Table users={this.state.users} />
            </React.Fragment>
        )
    }
}

const Table = (props) => {
    return (
        <table>
            <tr><td>ID</td><td>名字</td></tr>
            {
                props.users.map((user, i) => {
                    return <tr key={i}><td>{i}</td><td>{user.name}</td></tr>
                })
            }
        </table>
    )
}

const Input = (props) => {
    return (
        <React.Fragment>
            <input type="text" value={props.value} onChange={props.onChange} />
            <button type="button" onClick={props.submit}>提交</button>
        </React.Fragment>
    )
}
ReactDOM.render(<Hello />, document.getElementById("main"));