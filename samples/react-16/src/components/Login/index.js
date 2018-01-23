import React, { Component } from 'react'
import layer from '../../get-layer';
import config from '../../common/LayerConfiguration.json'
import './login_style.css'

const layerClient = layer.layerClient
const Layer = layer.Layer

window.googleMapsAPIKey = config[0].google_maps_key;

class Login extends Component {
  constructor (props) {
    super (props)
    this.state = {
      domLoaded: false,
      appId: config[0].app_id,
      identityProviderUrl: config[0].identity_provider_url + '/authenticate',
      userId: null,
      email: null,
      password: null,
      nonce: null,
      cb: null
    }
  }

  componentDidMount () {
    /**
     * Client authentication challenge.
     * Sign in to Layer sample identity provider service.
     */
    if (layerClient) {
      layerClient.on('challenge', e => {
        this.setState({
          nonce: e.nonce,
          cb: e.callback
        })
      })

      layerClient.on('ready', () => {})

      layerClient.connect()
    }

    window.document && document.addEventListener('DOMContentLoaded', () => {
      this.setState({ domLoaded: true })
    })
  }

  getIdentityToken () {
    const {
      email,
      password,
      nonce
    } = this.state
    Layer.Utils.xhr({
      url: this.state.identityProviderUrl,
      headers: {
        'Content-type': 'application/json',
        'Accept': 'application/json'
      },
      method: 'POST',
      data: {
        nonce: nonce,
        email: email,
        password: password
      }
    }, (res) => {
      if (res.success && res.data.identity_token) {
        this.state.cb(res.data.identity_token)

        const previousPathname = this.props.location.previousLocation ? this.props.location.previousLocation.pathname : null
        if (previousPathname)
          this.props.history.push(previousPathname)
        else
          this.props.history.push('/conversations')
      } else {
        alert('Login failed; please check your user id and password');
      }
    });
  }

  render() {
    if (!this.state.domLoaded) return null

    return (<div id="identity">
      <form>
      <img alt="layer" src="http://static.layer.com/logo-only-blue.png" />
      <h1>Welcome to Layer sample app!</h1>
      <div className="login-group">
        <label htmlFor="email">Email</label>
        <input type="text" id="email" onChange={e => this.setState({ email: e.target.value })}/>
      </div>
      <div className="login-group">
        <label htmlFor="password">Password</label>
        <input type="password" id="password" onChange={e => this.setState({ password: e.target.value })} />
      </div>
      <button type="button" value="Submit" onClick={() => this.getIdentityToken()}>
        {'Login'}
      </button>
    </form>
  </div>)
  }
}

export default Login;
