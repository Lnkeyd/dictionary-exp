import axios from "axios"

export const DictoinaryService = {
    // Все слова
  getAll: () => {
    return axios
      .get(`/api/dict`)
      .then((res) => res.data)
      .catch((err) => {
        if (err.response.data === 'no token' || 'invalid token') console.log('TOKEN PROBLEM SERVISE!!!')
        return err
      });
  },
  pushSession: ({username, session}) => {
    return axios
      .post(`/api/dict`, {username, session})
      .then((res) => res.data)
      .catch((err) => {
        if (err.response.data === 'no token' || 'invalid token') console.log('TOKEN PROBLEM SERVISE!!!')
        return err
      });
  }
}