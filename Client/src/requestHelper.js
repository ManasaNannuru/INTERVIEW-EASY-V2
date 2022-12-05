import axios from "axios";
export const uploadResume = (userUID, formData) => {
  //return axios.post("http://localhost:3001/upload", formData, {
  return axios.post(
    "https://interview-easy-back.herokuapp.com/upload",
    formData,
    {
      //return axios.post("https://interview-easy-v1-back-end.herokuapp.com/upload", formData, {
      headers: {
        "user-id": userUID,
      },
    }
  );
};

export const fetchResume = (otherUserUID) => {
  return axios.get(`http://localhost:3001/resume/${otherUserUID}`);
  //return axios.get(`https://interview-easy-v1-back-end.herokuapp.com/resume/${otherUserUID}`);
};
