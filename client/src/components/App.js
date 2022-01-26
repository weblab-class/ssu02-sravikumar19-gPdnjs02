import React, { Component, useState, useEffect } from "react";
import { Router } from "@reach/router";
import NotFound from "./pages/NotFound.js";
import Skeleton from "./pages/Skeleton.js";
import Profile from "./pages/Profile.js";
import Feed from "./modules/friends/Feed.js";

import SideBar from "./modules/SideBar.js";
import Friends from "./pages/Friends.js";
import "../utilities.css";
import "./App.css";
import { socket } from "../client-socket.js";
import { get, post } from "../utilities";
import 'foundation-sites/dist/css/foundation.min.css';
import Chatbook from "./modules/Chatbook.js";
import Chat from "./modules/Chat.js";



/**
 * Define the "App" component
 
 */

 class App extends Component {
  // makes props available in this component
  constructor(props) {
    super(props);
    this.state = {
      userId:undefined,
    };
  }

  componentDidMount() {
    get("/api/whoami").then((user) => {
      if (user._id) {
        // they are registed in the database, and currently logged in.
        this.setState({ userId: user._id });
      }
    });
  }
  handleLogin = (res) => {
    console.log(`Logged in as ${res.profileObj.name}`);
    const userToken = res.tokenObj.id_token;
    post("/api/login", { token: userToken }).then((user) => {
      this.setState({userId: user._id});
      post("/api/initsocket", { socketid: socket.id });
    });
  };

   handleLogout = () => {
    this.setState({userId: undefined});
    post("/api/logout").then(() => {window.location.href = "/progress";});

  };
  
  render() {

    return (
  
      <>
      <div className="App-container">
      <div className="b1">
      <SideBar handleLogin={this.handleLogin}
            handleLogout={this.handleLogout}
            userId={this.state.userId} />
      </div>
      <div>
        <Router>
          <Skeleton path="/dashboard/:userId" userId={this.state.userId}/>
<<<<<<< HEAD
          <Profile path="/profile/:userId" myUserId = {this.state.userId}/>
=======
          <Profile path="/profile/:userId" myUserId={this.state.userId} />
>>>>>>> 3af5644d7204b9749a18206c1b110dd42399b169
          <Friends path="/friends/:userId" userId={this.state.userId} />
          <NotFound default />
        </Router>
       </div>
       </div>
      </>
    );
    }
   
 }

export default App;



