import API from 'lib-app/api-call';
import sessionStore from 'lib-app/session-store';
import store from 'app/store';

import ConfigActions from 'actions/config-actions';

export default {
    login(loginData) {
        return {
            type: 'LOGIN',
            payload: API.call({
                path: '/user/login',
                data: loginData
            }).then((result) => {
                store.dispatch(this.getUserData(result.data.userId, result.data.token, result.data.staff));

                return result;
            })
        };
    },

    autoLogin() {
        const rememberData = sessionStore.getRememberData();

        return {
            type: 'LOGIN_AUTO',
            payload: API.call({
                path: '/user/login',
                data: {
                    userId: rememberData.userId,
                    rememberToken: rememberData.token,
                    isAutomatic: true
                }
            }).then((result) => {
                store.dispatch(this.getUserData(result.data.userId, result.data.token));

                return result;
            })
        };
    },

    logout() {
        return {
            type: 'LOGOUT',
            payload: API.call({
                path: '/user/logout',
                data: {}
            })
        };
    },

    getUserData(userId, token, staff) {
        let data  = {};

        if (userId && token) {
            data = {
                csrf_userid: userId,
                csrf_token: token
            };
        }

        return {
            type: 'USER_DATA',
            payload: API.call({
                path: (staff) ? '/staff/get' : '/user/get',
                data: data
            })
        }
    },

    initSession() {
        return {
            type: 'CHECK_SESSION',
            payload: API.call({
                path: '/user/check-session',
                data: {}
            }).then((result) => {
                if (!result.data.sessionActive) {
                    if (sessionStore.isRememberDataExpired()) {
                        store.dispatch({
                            type: 'LOGOUT_FULFILLED'
                        });
                    } else {
                        store.dispatch(this.autoLogin());
                    }
                } else {
                    store.dispatch({
                        type: 'SESSION_CHECKED'
                    });
                }
            })
        }
    }
};