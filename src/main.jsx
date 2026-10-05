import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ChatDockProvider } from './components/ChatDock'
import './styles.css'
createRoot(document.getElementById('root')).render(<BrowserRouter><ChatDockProvider><App /></ChatDockProvider></BrowserRouter>)
