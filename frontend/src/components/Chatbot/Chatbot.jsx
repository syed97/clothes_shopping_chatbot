import { useState } from "react";
import { TextField, Button, Card } from "@mui/material";

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    setTimeout(() => {
      const botResponse = { text: `Echo: ${input}`, sender: "bot" };
      setMessages((prev) => [...prev, botResponse]);
    }, 500);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4">
      <div className="flex-1 overflow-auto space-y-2">
        {messages.map((msg, index) => (
          <Card
            key={index}
            className={`max-w-xs p-3 rounded-2xl ${
              msg.sender === "user" ? "bg-blue-500 text-white self-end" : "bg-white text-black self-start"
            }`}
            style={{ padding: "10px", marginBottom: "8px" }}
          >
            {msg.text}
          </Card>
        ))}
      </div>
      <div className="flex gap-2 p-2 border-t bg-white">
        <TextField 
          fullWidth 
          variant="outlined" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Type a message..." 
        />
        <Button variant="contained" color="primary" onClick={sendMessage}>Send</Button>
      </div>
    </div>
  );
}
