import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom' 
import Index from './components/index.tsx'
import Plenum from './components/plenum.tsx'
import './App.css'

function App() {
  let router = createBrowserRouter(
    createRoutesFromElements([
      <>
        <Route path="/" element={<Index/>} />
        <Route path="/plenum/:meetingId" element={<Plenum/>} />
      </>
    ])
  )

  return (
    <RouterProvider router={router} />
  )
}

export default App
