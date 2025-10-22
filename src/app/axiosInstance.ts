import axios from "axios";

const instance = axios.create({
  baseURL: "https://front-mission.bigs.or.kr",
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
