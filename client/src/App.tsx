import { useState, useEffect} from 'react'
import fonLogo from './assets/blokada_fon.png'
import './App.css'
import axios from 'axios'

function App() {
  const [message, setMessage] = useState('')

  const fetchApi = async () => {
    //const response = await axios.get('https://e-moderator.vercel.app/api')
    const response = await axios.get('http://localhost:8080/api')
    setMessage(response.data.message)
  }

  useEffect(() => {
    fetchApi()
  }, [])

  return (
    <>
      <div>
        <a href="https://www.instagram.com/blokada.fon" target="_blank">
          <img src={fonLogo} className="logo" alt="Fon logo" />
        </a>
      </div>
      <h1>Dobrodošli u e-moderatora studenata FONa u blokadi</h1>
      <div className="card">
        <button>
          Počni e-plenum
        </button>
      </div>
      <p className="read-the-docs">
        Pritisnite na FON blokada logo da vidite zbog čega držimo ove plenume
      </p>
      {
        message && <p>{message}</p>
      }
    </>
  )
}

export default App
