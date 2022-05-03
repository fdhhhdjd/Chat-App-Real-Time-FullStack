import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
export const RegisterInitial = createAsyncThunk(
  "Auth/Register",
  async ({ RegisterRoute, username, email, password }) => {
    const response = await axios.post(RegisterRoute, {
      RegisterRoute,
      username,
      email,
      password,
    });
    return response.data;
  }
);
export const LoginInitial = createAsyncThunk(
  "Auth/Login",
  async ({ LoginRoute, username, password }) => {
    const response = await axios.post(LoginRoute, {
      username,
      password,
    });
    return response.data;
  }
);
export const LogoutInitial = createAsyncThunk(
  "Auth/Logout",
  async ({ LogoutRoute, id }) => {
    const response = await axios.post(`${LogoutRoute}/${id}`);
    return response.data;
  }
);
export const SetAvatarAuthInitial = createAsyncThunk(
  "Auth/SetAvatar",
  async ({ SetAVatarRoute, image, id }) => {
    console.log(SetAVatarRoute, "oke");
    const response = await axios.post(`${SetAVatarRoute}/${id}`, {
      image,
    });
    return response.data;
  }
);
const initialState = {
  loading: false,
  error: null,
  auth: [],
};
const AuthenticationSlice = createSlice({
  name: "Auth",
  initialState,
  reducers: {
    reset: (state) => {
      state.auth = [];
    },
  },
  extraReducers: {
    //? Register
    [RegisterInitial.pending]: (state, action) => {
      state.loading = true;
    },
    [RegisterInitial.fulfilled]: (state, action) => {
      state.loading = false;
      state.auth = action.payload;
    },
    [RegisterInitial.rejected]: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    //?Login
    [LoginInitial.pending]: (state, action) => {
      state.loading = true;
    },
    [LoginInitial.fulfilled]: (state, action) => {
      state.loading = false;
      state.auth = action.payload;
    },
    [LoginInitial.rejected]: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    //?Set Avatar
    [SetAvatarAuthInitial.pending]: (state, action) => {
      state.loading = true;
    },
    [SetAvatarAuthInitial.fulfilled]: (state, action) => {
      state.loading = false;
    },
    [SetAvatarAuthInitial.rejected]: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});
const Authentication = AuthenticationSlice.reducer;
export const { reset } = AuthenticationSlice.actions;
export default Authentication;
