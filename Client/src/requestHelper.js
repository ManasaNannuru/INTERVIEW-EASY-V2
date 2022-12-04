import axios from "axios";

export const uploadResume = (userUID, formData) => {
  return axios.post("http://localhost:3001/upload", formData, {
    headers: {
      "user-id": userUID,
    },
  });
};

export const fetchResume = (otherUserUID) => {
  return axios.get(`http://localhost:3001/resume/${otherUserUID}`);
};
