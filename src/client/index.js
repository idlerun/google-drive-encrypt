require('!style-loader!css-loader!sass-loader!./css/app.sass');
import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

var Main = React.createClass({

  getInitialState() {
    return { message: "" }
  },

  componentWillMount() {
    $.ajax({
      type: "GET",
      url: "/hello/MY_NAME",
      success: (message) => {
        this.setState({message})
      },
      error: (xhr, status, err) => {
        console.log("FAIL", status, err)
      }
    })
  },

  render() {
    return (
      <div>
        <p>Server says: {this.state.message}</p>
        <p>Here is a resource from src/public/baby.gif</p>
        <img src="/baby.gif"/>
      </div>
    )
  }
});

ReactDOM.render( <Main />, document.querySelector('#root') );
