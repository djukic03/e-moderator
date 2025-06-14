import './plenum.css'
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { QRCodeCanvas } from 'qrcode.react';
import socket from '../socket/socket';
import UserCard from './userCard.tsx';

interface Plenum {
  meetingId: string;
  moderatorId: string;
  users: { clientId: string; name: string }[];
}

interface Speakers {
  meetingId: string;
  users: {clientId: string; name: string; typeOfSpeech: string; }[];
}

const plenum = () => {
  const { meetingId } = useParams();
  const [name, setName] = useState<string | null>(sessionStorage.getItem("name"));
  const [inputName, setInputName] = useState("");
  const [plenum, setPlenum] = useState<Plenum | null>(null);
  const [meetingSpeakers, setMeetingSpeakers] = useState<Speakers | null>(null);
  const sortedSpeakers = [...(meetingSpeakers?.users || [])].sort((a, b) => {
    if (a.typeOfSpeech === "Tehnička" && b.typeOfSpeech !== "Tehnička") {
      return -1;
    }
    if (a.typeOfSpeech !== "Tehnička" && b.typeOfSpeech === "Tehnička") {
      return 1;
    }
    return 0;
  });
  const [isModerator, setIsModerator] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const url = `http://localhost:5173/plenum/${meetingId}`
  //const url = `https://e-moderator-front.vercel.app/plenum/${meetingId}`
  
  useEffect(() => {
    if (!meetingId) return;

    const clientId = sessionStorage.getItem("clientId");
    if (!clientId) return;

    socket.emit("get_plenum", meetingId, (response: { plenum?: Plenum; meetingSpeakers?: Speakers; error?: string }) => {
      if (response.error) {
        console.error(response.error);
        return;
      }

      const plenumData = response.plenum!;
      setPlenum(plenumData);

      const meetingSpeakers = response.meetingSpeakers!;
      setMeetingSpeakers(meetingSpeakers);

      if (clientId === plenumData.moderatorId) {
        setIsModerator(true);
        setName("Moderator");
        sessionStorage.setItem("name", "Moderator");
      }
    });
  }, [meetingId]);

  useEffect(() => {
    if (name && meetingId) {
      const clientId = sessionStorage.getItem("clientId");
      socket.emit("join_meeting", { meetingId, clientId, name });
    }

    socket.on("joined_meeting", ( plenum ) => {
      setPlenum(plenum);
    });

    socket.on("left_meeting", ( plenum, speakers ) => {
      setPlenum(plenum);
      setMeetingSpeakers(speakers);
    });

    return () => {
      socket.off("joined_meeting");
      socket.off("left_meeting");
    };
  }, [name, meetingId]);

  useEffect(() => {
    socket.on("speech_requested", (meetingSpeakers) => {
      setMeetingSpeakers(meetingSpeakers);
      console.log(meetingSpeakers.users);
    });

    socket.on("request_cancelled", (meetingSpeakers) => {
      setMeetingSpeakers(meetingSpeakers);
      console.log(meetingSpeakers.users);
    });

    socket.on("timer_started", (clientId) => {
      console.log(`Timer started for ${clientId}`);
      setActiveSpeaker(clientId);
    });

    socket.on("timer_ended", (clientId) => {
      console.log(`Timer ended for ${clientId}`);
      setActiveSpeaker(null);
    });

    return () => {
      socket.off("speech_requested");
      socket.off("request_cancelled");
      socket.off("timer_started");
      socket.off("timer_ended");
    };
  }, []);

  const handleJoin = () => {
    if (inputName.trim()){
      if (inputName.trim() === "Moderator") {
        alert("Ime Moderator je zauzeto.");
        return;
      }
      sessionStorage.setItem("name", inputName);
      setName(inputName);
    }
    else {
      alert("Unesite ime.");
    }
  }

  const handleRequest = (typeOfSpeech: string) => {
    const clientId = sessionStorage.getItem("clientId");
    socket.emit("request_to_speak", { meetingId, clientId, typeOfSpeech });
  }

  const handleCancel = (clientId: string) => {
    socket.emit("cancel_request", { meetingId, clientId });
  }

  const handleStartTimer = (clientId: string) => {
    socket.emit("start_timer", clientId );
  }

  const handleEndTimer = (clientId: string) => {
    socket.emit("end_timer", clientId );
    socket.emit("cancel_request", { meetingId, clientId });
  }

  if(!name && !isModerator){
    return (
      <div className='container'>
        <input type="text" placeholder="Unesite ime" value={inputName} onChange={(e) => setInputName(e.target.value)} />
        <button onClick={handleJoin}>Udji u plenum</button>
      </div>
    )
  }

  return (
    <div className='fullHeight'>
      <div className='left'>
        <div className='title'>
          <h2>Tražili reč:</h2>
        </div>
        <div className='users'>
          {
            sortedSpeakers?.map((speaker, index) => ( 
              <UserCard key={index} speaker={speaker} callback={handleCancel} onStartTimer={handleStartTimer} onEndTimer={handleEndTimer} activeSpeaker={activeSpeaker} isFirst={index === 0}/>
            ))
          }
        </div>
      </div>
      <div className='right'>
        <div className='title'>
          <h3>U e-plenumu: {plenum?.users.length}</h3>
        </div>
        <div className='users'>
            {
                plenum?.users.map((user, index) => (
                    <p key={index}>{user.name}</p>
                ))
            }
        </div>
        {
          isModerator && (
            <div className='qrcode'>
              <QRCodeCanvas value={url} size={200} />
            </div>
          )
        }
        
      </div>
        {
          isModerator ? (
            <div className='buttons'>
              <button>Pokreni glasanje</button>
              <button>Pauza</button>
              <button>Zavrsi plenum</button>
            </div>
          ) : (
            <div className='buttons'>
              <button disabled={meetingSpeakers?.users.some((speaker) => speaker.clientId === sessionStorage.getItem("clientId"))} onClick={() => handleRequest("Reč")}>Traži reč</button>
              <button disabled={meetingSpeakers?.users.some((speaker) => speaker.clientId === sessionStorage.getItem("clientId"))} onClick={() => handleRequest("Amandman")}>Amandman</button>
              <button disabled={meetingSpeakers?.users.some((speaker) => speaker.clientId === sessionStorage.getItem("clientId"))} onClick={() => handleRequest("Tehnička")}>Tehnička</button>
            </div>
          )
        }
    </div>
  )
}

export default plenum