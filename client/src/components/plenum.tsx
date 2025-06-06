import React from 'react'
import './plenum.css'

const plenum = () => {
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
            <p>Jovan</p>
            <p>Pera</p>
            <p>Mika</p>
        </div>
        <div className='qrcode'>

        </div>
      </div>
    </div>
  )
}

export default plenum