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
  const [name, setName] = useState<string | null>(localStorage.getItem("name"));
  const [inputName, setInputName] = useState("");
  const [plenum, setPlenum] = useState<Plenum | null>(null);
  const [meetingSpeakers, setMeetingSpeakers] = useState<Speakers | null>(null);
  const [isModerator, setIsModerator] = useState(false);
  //const url = `http://localhost:5173/plenum/${meetingId}`
  const url = `https://e-moderator-front.vercel.app/plenum/${meetingId}`
  
  useEffect(() => {
    if (!meetingId) return;

    const clientId = localStorage.getItem("clientId");
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
        localStorage.setItem("name", "Moderator");
      }
    });
  }, [meetingId]);

  useEffect(() => {
    if (name && meetingId) {
      const clientId = localStorage.getItem("clientId");
      socket.emit("join_meeting", { meetingId, clientId, name });
    }

    socket.on("joined_meeting", ( plenum ) => {
      setPlenum(plenum);
    });

    socket.on("left_meeting", ( plenum ) => {
      setPlenum(plenum);
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

    return () => {
      socket.off("speech_requested");
    };
  }, []);

  const handleJoin = () => {
    if (inputName.trim()){
      localStorage.setItem("name", inputName);
      setName(inputName);
    }
  }

  const handleRequest = (typeOfSpeech: string) => {
    const clientId = localStorage.getItem("clientId");
    socket.emit("request_to_speak", { meetingId, clientId, typeOfSpeech });
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
    <>
      <div className='left'>
        <div className='title'>
          <h2>Tražili reč:</h2>
        </div>
        <div className='users'>
          {
            meetingSpeakers?.users.map((speaker, index) => ( 
              <UserCard key={index} name={speaker.name} typeOfSpeech={speaker.typeOfSpeech} />
            ))
          }
        </div>
      </div>
      <div className='right'>
        <div className='title'>
          <h3>U e-plenumu</h3>
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
      <div>
        {
          isModerator ? (
            <div className='buttons'>
              <button>Pokreni glasanje</button>
              <button>Pauza</button>
              <button>Zavrsi plenum</button>
            </div>
          ) : (
            <div className='buttons'>
              <button onClick={() => handleRequest("Reč")}>Traži reč</button>
              <button onClick={() => handleRequest("Amandman")}>Amandman</button>
              <button onClick={() => handleRequest("Tehnička")}>Tehnička</button>
            </div>
          )
        }
        
    </div>
    </>
  )
}

export default plenum