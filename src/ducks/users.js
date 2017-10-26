import axios from 'axios';


const initialState= {
    user:[]
}

const GET_USER = 'GET_USER';

export function getUser() {
    const user = axios.get('/auth/user')
        .then(res => {
            return res.data;
        })
    return {
        type: GET_USER,
        payload: user
    }
}

export default function reducer(state = initialState, action) {
    switch(action.type) {
        case GET_USER + '_FULFILLED':
        console.log(action.payload);
            return Object.assign({}, state, {user: action.payload});
        break;

    default:
        return state;
    } 
}