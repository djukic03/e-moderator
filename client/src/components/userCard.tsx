import React from 'react'
import './userCard.css'

const userCard : React.FC = () => {
  return (
    <div className='card'>
      <h3>Korisnik</h3>
      <div className='speech'>
        <p>Poruka</p>
        <button>X</button>
      </div>
    </div>
  )
}

export default userCard