import axios from "axios";


const authEndpoint = "/api";

export const authUser = async (username, password) => {

    try {
      const res = await axios.post(`${authEndpoint}/login`, {
        username,
        password,
      });
      if (res.status === 200) {
        // token
        console.log(res.data)
        return res.data
      }
    } catch (err) {
      console.log(err)
    }
};