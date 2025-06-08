import './plenum.css'
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import socket from '../socket/socket';

interface Plenum {
  meetingId: string;
  moderatorId: string;
  users: { clientId: string; name: string }[];
}

const plenum = () => {
  const { meetingId } = useParams();
  const [name, setName] = useState<string | null>(localStorage.getItem("name"));
  const [inputName, setInputName] = useState("");
  const [plenum, setPlenum] = useState<Plenum | null>(null);
  const [isModerator, setIsModerator] = useState(false);
  
  useEffect(() => {
    if (!meetingId) return;

    const clientId = localStorage.getItem("clientId");
    if (!clientId) return;

    socket.emit("get_plenum", meetingId, (response: { plenum?: Plenum; error?: string }) => {
      if (response.error) {
        console.error(response.error);
        return;
      }

      const plenumData = response.plenum!;
      setPlenum(plenumData);

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

    socket.on("joined_meeting", ({ plenum }) => {
      setPlenum(plenum);
    });

    return () => {
      socket.off("joined_meeting");
    };
  }, [name, meetingId]);

  const handleJoin = () => {
    if (inputName.trim()){
      localStorage.setItem("name", inputName);
      setName(inputName);
    }
  }

  if(!name || !isModerator){
    return (
      <div className='container'>
        <input type="text" placeholder="Unesite ime" value={inputName} onChange={(e) => setInputName(e.target.value)} />
        <button onClick={handleJoin}>Udji u plenum</button>
      </div>
    )
  }

  return (
    <div className='container'>
      <div className='usersToSpeak'>
            <div className='title'>
                <h2>Tražili reč:</h2>
            </div>
            <div className='users'>
                <p>Jovan</p>
                <p>Pera</p>
                <p>Mika</p>
            </div>
      </div>
      <div className='usersInPlenum'>
        <h3 className='title'>U e-plenumu</h3>
        <div className='users'>
            {
                plenum?.users.map((user) => (
                    <p>{user.name}</p>
                ))
            }
        </div>
        <div className='qrcode'>

        </div>
      </div>
      <div>
        <button >Придружи се састанку</button>
        <>
          <button >Јави се за реч ✋</button>
          <button >Гласам ЗА ✅</button>
          <button >Гласам ПРОТИВ ❌</button>
        </>
    </div>
    </div>
  )
}

export default plenum