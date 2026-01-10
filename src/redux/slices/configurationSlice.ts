import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ConfigurationState {
    selectedOptions: Record<string, string>;
}

const initialState: ConfigurationState = {
    selectedOptions: {},
};

export const configurationSlice = createSlice({
    name: "configuration",
    initialState,
    reducers: {
        setOption: (state, action: PayloadAction<{ name: string; value: string }>) => {
            state.selectedOptions[action.payload.name] = action.payload.value;
        },
        resetConfiguration: (state) => {
            state.selectedOptions = {};
        },
    },
});

export const { setOption, resetConfiguration } = configurationSlice.actions;
export default configurationSlice.reducer;
