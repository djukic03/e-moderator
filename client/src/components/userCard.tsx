import React from 'react'
import './userCard.css'

interface User{
  clientId: string;
  name: string;
  typeOfSpeech: string;
}

interface UserCardProps {
  speaker: User;
  callback: (clientId: string) => void;
}

const userCard : React.FC<UserCardProps> = ({speaker, callback}) => {
  const clientId = sessionStorage.getItem("clientId");
  const isCurrentUser = speaker.clientId === clientId;

  const handleCancel = () => {
    callback(speaker.clientId);
  }

  return (
    <div className='userCard'>
      <h3>{speaker.name}</h3>
      <div className='speech'>
        <p>{speaker.typeOfSpeech}</p>
        {isCurrentUser && 
          <button onClick={handleCancel}>X</button>
        }
      </div>
    </div>
  )
}

export default userCard