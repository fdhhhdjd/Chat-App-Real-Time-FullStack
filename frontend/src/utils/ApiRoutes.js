const host = "http://localhost:5000";
//!register
export const RegisterRoute = `${host}/api/auth/register`;

//!login
export const LoginRoute = `${host}/api/auth/login`;

////!logout
export const LogoutRoute = `${host}/api/auth/logout`;

//!Get Profile
export const GetProfile = (id) => {
  return `${host}/api/auth/getall/${id}`;
};
//!set Avatar
export const SetAVatarRoute = `${host}/api/auth/setavatar`;
