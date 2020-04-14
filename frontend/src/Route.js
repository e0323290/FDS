import React, { Component } from "react";
import { Router, Switch, Route } from "react-router-dom";

import About from './Pages/About/About';
// import Contact from "./Contact/Contact";
// import Products from "./Product/Products";
import Login from './Pages/Login/Login';
import Signup from './Pages/Signup/Signup';
import Logout from './Pages/Logout/Logout';
import CustomerHome from "./Pages/Customer/Home";
import ManagerHome from "./Pages/Manager/Home";
import RiderHome from "./Pages/Rider/Home";
import StaffHome from "./Pages/Staff/Home";
import RestaurantSearch from './Pages/SearchResult/SearchResult';

import history from "./history";
import HomePage from './Pages/HomePage/HomePage';

import { authenticationService } from './services';
import { userType } from './helpers';

export default class Routes extends Component {
  state = {
    currentUser: null,
    isCustomer: false,
    isStaff: false,
    isRider: false,
    isManager: false
  }

  componentDidMount() {
    authenticationService.currentUser.subscribe(x => this.setState({
      currentUser: x
    }));
    authenticationService.currentUserType.subscribe(x => this.setState({
      isCustomer: x && x === userType.Customer,
      isStaff: x && x === userType.Staff,
      isRider: x && x === userType.Rider,
      isManager: x && x === userType.Manager
    }))
  }

  render() {
    return (
      <Router history={history}>
        <Switch>
          {/* <Route path="/" exact component={Home} /> */}
          <Route path="/Home" component={HomePage} />
          {/* <Route path="/About" component={About} /> */}
          <Route path="/login" exact component={Login} />
          <Route path="/signup" exact component={Signup} />
          { this.state.isCustomer && <Route path="/dashboard" exact component = {CustomerHome} /> }
          { this.state.isRider && <Route path="/dashboard" exact component = {RiderHome} /> }
          { this.state.isManager && <Route path="/dashboard" exact component = {ManagerHome} /> }
          { this.state.isStaff && <Route path="/dashboard" exact component = {StaffHome} /> }
          <Route path="/restaurant/search" component = {RestaurantSearch} />
          <Route path="/logout" exact component = {Logout} />
        </Switch>
      </Router>
    );
  }
}
