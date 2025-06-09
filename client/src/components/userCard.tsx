import React from 'react'
import './userCard.css'

interface UserCardProps {
  name: string;
  typeOfSpeech: string;
}

const userCard : React.FC<UserCardProps> = ({name, typeOfSpeech}) => {
  return (
    <div className='userCard'>
      <h3>{name}</h3>
      <div className='speech'>
        <p>{typeOfSpeech}</p>
        <button>X</button>
      </div>
    </div>
  )
}

export default userCard