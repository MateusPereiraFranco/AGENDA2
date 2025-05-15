// services/authStorage.js

const STORAGE_KEY = 'user';

export const saveUserToSession = (user) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
};

export const getUserFromSession = () => {
    const user = sessionStorage.getItem(STORAGE_KEY);
    return user ? JSON.parse(user) : null;
};

export const clearUserFromSession = () => {
    sessionStorage.removeItem(STORAGE_KEY);
};