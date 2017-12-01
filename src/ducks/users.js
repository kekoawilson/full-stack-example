import axios from 'axios';

const initialState = {
    userData: {}
}


const GET_USER = 'GET_USER';



export function getUser() {
    const userInfo = axios.get('/auth/me')
        .then( res => {
            console.log(res.data);
           return res.data });

    return {
        type: GET_USER,
        payload: userInfo
    }
}



export default function reducer( state = initialState, action ) {
    switch ( action.type ) {
        case GET_USER + '_FULFILLED':
            return Object.assign( {}, state, { userData: action.payload })
        default:
           return state;
    }
}