import React from 'react';
import Chatbot from './components/Chatbot/Chatbot';  // Importing from components folder
import './App.css'

function App() {
  return (
    <div className="App">
      <h1>Welcome to the Chatbot App</h1>
      <Chatbot /> {/* Use the Chatbot component */}
    </div>
  );
}

export default App
