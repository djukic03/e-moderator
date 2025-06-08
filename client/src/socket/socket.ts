import { io } from "socket.io-client";

const getClientId = (): string => {
  const saved = localStorage.getItem("clientId");
  if (saved) return saved;
  const newId = crypto.randomUUID();
  localStorage.setItem("clientId", newId);
  return newId;
};

const socket = io("https://e-moderator-back.onrender.com", {
//const socket = io("http://localhost:8080", {
    auth: {
      clientId: getClientId(),
    },
});
export default socket;
