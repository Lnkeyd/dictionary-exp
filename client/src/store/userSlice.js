import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  type: 'user',
  token: null,
  session: [],
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setAuthUser: (state, action) => {
      state.token = action.payload.accessToken;
      state.user = action.payload.user;
    },
    removeAuthUser: (state) => {
      state.token = null;
      state.user = null;
    },
    initSession: (state, action) => {
      const newSession = action.payload.map((item) => {
        return {
          word: item,
          reaction: "",
        };
      });
      state.session = newSession
    },
    updateWord: (state, action) => {
      const rightObject =  state.session.find(item => item.word === action.payload.word)
      rightObject.reaction = action.payload.reaction
    }
  },
});

// Action creators are generated for each case reducer function
export const { setAuthUser, removeAuthUser, initSession, updateWord } = userSlice.actions;

export default userSlice.reducer;
