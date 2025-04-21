// lib/auth.ts
let loggedIn = false;

export const login = (username: string, password: string) => {
  if (username === 'admin' && password === 'password') {
    loggedIn = true;
    return true;
  }
  return false;
};

export const isLoggedIn = () => loggedIn;
