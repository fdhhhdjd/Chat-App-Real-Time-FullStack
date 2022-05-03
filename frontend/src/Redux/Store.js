import { configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";
import AuthenticationSlice from "./AuthenticationSlice";

const rootReducer = (state, action) => {
  if (action.type === "counter/clear") {
    state = undefined;
  }
  return AuthenticationSlice(state, action);
};
const store = configureStore({
  reducer: {
    auth: AuthenticationSlice,
    reducer: rootReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
  devTools: process.env.NODE_ENV !== "production",
});

export default store;
