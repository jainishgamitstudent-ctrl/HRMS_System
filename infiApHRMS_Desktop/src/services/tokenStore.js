// In-memory + sessionStorage token store
// - In-memory: fast access within the same JS session
// - sessionStorage: survives page refreshes within the same browser tab
//   (unlike localStorage, sessionStorage is cleared when the tab is closed — safer)

let currentToken = null;
let currentRole = null;

export const tokenStore = {
  setToken: (token) => {
    currentToken = token;
    if (token) {
      sessionStorage.setItem("auth_token", token);
    } else {
      sessionStorage.removeItem("auth_token");
    }
  },
  getToken: () => currentToken || sessionStorage.getItem("auth_token"),
  clearToken: () => {
    currentToken = null;
    currentRole = null;
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_role");
  },
  setRole: (role) => {
    currentRole = role;
    if (role) {
      sessionStorage.setItem("auth_role", role);
    } else {
      sessionStorage.removeItem("auth_role");
    }
  },
  getRole: () => currentRole || sessionStorage.getItem("auth_role"),
};
