import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

interface MainState {
  isFetchingQuery: boolean;
  errorMessage: string;
  smartWidgets: any[];
  notify: {
    showNotification: boolean;
    textNotification: string;
    typeNotification: string;
  };
}
const initialState: MainState = {
  isFetchingQuery: false,
  errorMessage: '',
  smartWidgets: [],
  notify: {
    showNotification: false,
    textNotification: '',
    typeNotification: 'warn',
  },
};

const fulfilledNotify = (state, msg, type?: string) => {
  state.notify.textNotification = msg;
  state.notify.typeNotification = type || 'success';
  state.notify.showNotification = true;
};

export const aiPrompt = createAsyncThunk(
  'openai/aiPrompt',
  async (data: any, { rejectWithValue }) => {
    try {
      return await axios.post('/openai/create_widget', data);
    } catch (error) {
      if (!error.response) {
        throw error;
      }
      return rejectWithValue(error.response.data);
    }
  },
);

export const openAiSlice = createSlice({
  name: 'openAiSlice',
  initialState,
  reducers: {
    resetNotify: (state) => {
      state.notify.showNotification = false;
      state.notify.typeNotification = '';
      state.notify.textNotification = '';
    },
    setErrorNotification: (state, action) => {
      fulfilledNotify(state, action.payload, 'error');
    },
  },
  extraReducers: (builder) => {
    builder.addCase(aiPrompt.pending, (state) => {
      state.isFetchingQuery = true;
    });
    builder.addCase(aiPrompt.fulfilled, (state, action: Record<any, any>) => {
      state.isFetchingQuery = false;
      state.errorMessage = '';
      state.smartWidgets.unshift(action.payload.data);
    });

    builder.addCase(aiPrompt.rejected, (state) => {
      state.errorMessage = 'Something was wrong. Try again';
      state.isFetchingQuery = false;
      state.smartWidgets = null;
    });
  },
});

// Action creators are generated for each case reducer function
export const { resetNotify, setErrorNotification } = openAiSlice.actions;

export default openAiSlice.reducer;
