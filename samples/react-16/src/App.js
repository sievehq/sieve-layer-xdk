import React, { Component } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import Login from './components/Login'
import Messenger from './components/Messenger'
import '../node_modules/@layerhq/web-xdk/themes/build/layer-basic-blue.css'

class App extends Component {
  render() {
    return (<BrowserRouter>
      <Switch>
        <Route exact path='/' component={Login} />
        <Route exact path='/conversations' component={Messenger} />
        <Route path='/conversations/:conversationId' component={Messenger} />
      </Switch>
    </BrowserRouter>)
  }
}

export default App;
