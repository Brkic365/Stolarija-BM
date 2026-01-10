// store.js
import { configureStore } from "@reduxjs/toolkit";
import { filterSlice } from "./slices/filterSlice";
import { configurationSlice } from "./slices/configurationSlice";

export const store = configureStore({
  reducer: {
    filter: filterSlice.reducer,
    configuration: configurationSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
