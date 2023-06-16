import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  session: [],
};

// const userLogin = createAsyncThunk(
//   'user/login',
//   async ({username, password}, thunkAPI) => {
//     const response = await userAPI.fetchById(userId)
//     return response.data
//   }
// )

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserToken: (state, action) => {
      state.user = action.payload;
    },
    removeUserToken: (state) => {
      state.user = null;
      state.session = [];
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
  // extraReducers: {
  //   [userLogin.pending]: (state, action) => {
  //     return state + action.payload
  //   },
  // },
});

// Action creators are generated for each case reducer function
export const { setUserToken, removeUserToken, initSession, updateWord } = userSlice.actions;

export default userSlice.reducer;
