import React, { Component } from "react";
import { Link } from "@reach/router";
import GoogleLogin, { GoogleLogout } from "react-google-login";
import logo from "../../public/logo.png";
import "./SideBar.css";

// This identifies your web application to Google's authentication service
const GOOGLE_CLIENT_ID = "732721046468-lqep618inia61e4p3nlvn1jft5c58fp4.apps.googleusercontent.com";

/**
 * The navigation bar at the top of all pages. Takes no props.
 */
class SideBar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
/*<div><img src={logo} alt="logo.png" /></div>*/
      <nav className="SideBar-container"> 

       <div className="SideBar-linkContainer u-inlineBlock">
        
          <div><Link to="/dashboard" className="SideBar-link">
            dashboard
          </Link></div>
          
          <div><Link to="/progress/" className="SideBar-link">
            progress
          </Link></div>
          <div><Link to="/friends/" className="SideBar-link">
            friends
          </Link></div>
          <div>{this.props.userId ? (
            <GoogleLogout
              clientId={GOOGLE_CLIENT_ID}
              buttonText="Logout"
              onLogoutSuccess={this.props.handleLogout}
              onFailure={(err) => console.log(err)}
              className="SideBar-link"
            />
          ) : (
            <GoogleLogin
              clientId={GOOGLE_CLIENT_ID}
              buttonText="Login"
              onSuccess={this.props.handleLogin}
              onFailure={(err) => console.log(err)}
              className="SideBar-link"
            />
          )}</div>
          <div>{this.props.userId && (
            <Link to={`/profile/${this.props.userId}`} className="SideBar-link">
              profile
            </Link>
          )}</div>
        </div>
        
      </nav>
    );
  }
}

export default SideBar;