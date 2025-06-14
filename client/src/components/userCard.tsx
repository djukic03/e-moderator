import React, { useEffect, useState } from 'react'
import Timer from './timer'
import './userCard.css'

interface User{
  clientId: string;
  name: string;
  typeOfSpeech: string;
}

interface UserCardProps {
  speaker: User;
  callback: (clientId: string) => void;
  onStartTimer: (clientId: string) => void;
  onEndTimer: (clientId: string) => void;
  activeSpeaker: string | null;
  isFirst: boolean;
}

const userCard : React.FC<UserCardProps> = ({speaker, callback, onStartTimer, onEndTimer, activeSpeaker, isFirst}) => {
  const clientId = sessionStorage.getItem("clientId");
  const isCurrentUser = speaker.clientId === clientId;
  const isModerator = sessionStorage.getItem("name") === "Moderator";
  const isActiveSpeaker = speaker.clientId === activeSpeaker;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTimeExpired, setIsTimeExpired] = useState(false);
  const getSeconds = (type: string) => {
    switch (type) {
      case 'Reč':
        return 300;
      case 'Amandman':
        return 60;
      case 'Tehnička':
        return 30;
      default:
        return 0;
    }
  }

  useEffect(() => {
    if (!isActiveSpeaker) {
      setIsTimeExpired(false);
      setIsSpeaking(false);
    }
  }, [isActiveSpeaker]);

  const handleGiveSpeech = () => {
    setIsSpeaking(true);
    setIsTimeExpired(false);
    onStartTimer(speaker.clientId);
  }

  const handleEndSpeech = () => {
    setIsSpeaking(false);
    setIsTimeExpired(false);
    onEndTimer(speaker.clientId);
  }

  const handleCancel = () => {
    callback(speaker.clientId);
  }

  const handleTimeIsUp = () => {
    setIsTimeExpired(true);
  }

  return (
    <div className='userCard'>
      <h3>{speaker.name}</h3>
      <div className='speech'>
        <p>{speaker.typeOfSpeech}</p>
        {isCurrentUser && !isActiveSpeaker &&
          <button onClick={handleCancel}>X</button>
        }
        {isModerator && !isSpeaking &&
          <button onClick={handleGiveSpeech} disabled={!isFirst}>Daj reč</button>
        }
        {isModerator && isSpeaking &&
          <button onClick={handleEndSpeech}>Prekini</button>
        }
        {isActiveSpeaker && (
          <>
            <Timer seconds={getSeconds(speaker.typeOfSpeech)} onComplete={handleTimeIsUp} />
            {isCurrentUser &&
              <button onClick={handleEndSpeech}>Završi</button>
            }
          </>
        )}
        {isTimeExpired && isActiveSpeaker && (isModerator || isCurrentUser) && (
          <div className='timeExpiredContainer'>
            <div className='timeExpired'>
              <h3>Vreme je isteklo</h3>
              <Timer seconds={0} onComplete={ () => {} } />
              {isCurrentUser &&
                <button onClick={handleEndSpeech}>Završi</button>
              }
              {isModerator &&
                <button onClick={handleEndSpeech}>Prekini</button>
              }
            </div>
          </div>
        )
        }
      </div>
    </div>
  )
}

export default userCard