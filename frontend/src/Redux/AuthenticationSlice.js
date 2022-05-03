import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
const initialState = {
  loading: false,
  error: null,
};
const AuthenticationSlice = createSlice({
  name: "Authentication",
  initialState,
  reducers: {
    reset: (state) => {},
  },
  extraReducers: {},
});
const Authentication = AuthenticationSlice.reducer;
export const { reset } = AuthenticationSlice.actions;
export default Authentication;
