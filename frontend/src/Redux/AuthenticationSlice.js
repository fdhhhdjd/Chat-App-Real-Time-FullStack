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
  },
});
const Authentication = AuthenticationSlice.reducer;
export const { reset } = AuthenticationSlice.actions;
export default Authentication;
