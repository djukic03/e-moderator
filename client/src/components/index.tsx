import React from 'react'
import fonLogo from '../assets/blokada_fon.png'
import { useNavigate } from 'react-router-dom'
import Socket from '../socket/socket.ts'

const index: React.FC = () => {
  const navigate = useNavigate();

  const startMeeting = () => {
    const moderator = sessionStorage.getItem("clientId");
    Socket.emit("create_meeting", { moderator });
    
    Socket.once("meeting_created", (meetingId) => {
      sessionStorage.setItem("name", "Moderator");
      navigate(`/plenum/${meetingId}`);
    });
  };

  return (
    <>
      <div>
        <a href="https://www.instagram.com/blokada.fon" target="_blank">
          <img src={fonLogo} className="logo" alt="Fon logo" />
        </a>
      </div>
      <h1>Dobrodošli u e-moderatora studenata FONa u blokadi</h1>
      <div className="card">
          <button onClick={startMeeting}>Počni e-plenum</button>
      </div>
      <h2>ZAHTEVI NISU ISPUNJENI!!!</h2>
      <p className="read-the-docs">
        Za više informacija, kliknite na blokada FON logo
      </p>
      
    </>
  )
}

export default index
