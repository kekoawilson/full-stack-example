import React, { Component } from 'react';
import './Private.css';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { getUser } from './../../ducks/users';

class Private extends Component {
    
    componentDidMount() {
        this.props.getUser()
    }

    render() {
        const loginJSX = (
            this.props.user ? 
                <div className='info-container'>
                    <h1>Community Bank</h1><hr />
                    <h4>Account information:</h4>
                    <img className='avatar' src={this.props.user.img} alt='User Img'/>
                    <p>Username: {this.props.user.user_name}</p>
                    <p>Email: {this.props.user.email}</p>
                    <p>ID: {this.props.user.auth_id}</p>
                    <h4>Available balance: {'$' + Math.floor((Math.random() + 1) * 100) + '.00'} </h4>
                    <a href={ process.env.AUTH_LANDING_REDIRECT }><button>Log out</button></a>
                </div>
            :
                <div className='info-container'>
                    <h1>Community Bank</h1><hr />
                    <h4>Please log in to view bank information.</h4>
                    <Link to='/'><button>Log in</button></Link>
                </div> 
        )

        return (
            <div>
                { loginJSX }
            </div> 
        )
    }
}
    function mapStateToProps( state ) {  //this maps state to the props object which now makes it available through this.props as seen above in ternary value
        return {
            user: state.userData
        }
    }

    export default connect( mapStateToProps, { getUser } )( Private )  //getUser function also gets merged to the props object, ( Private ) = connecting it to the component

