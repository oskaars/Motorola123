// components/GameControls.tsx
import React, { useState } from 'react';
import '../styles/globals.css'


interface Props {
    isConnected: boolean,
    sendMessage: (message: string) => void,
    playerRole: string,
}

const GameControls: React.FC<Props> = ({ isConnected, sendMessage, playerRole }) => {

    const [messageText, setMessageText] = useState('')
    const handleSendMessage = () => {
        sendMessage(messageText);
        setMessageText("");
    }


    return (
        <div className={"controls"}>
            <p>Player: {playerRole}</p>
            <p>Status: {isConnected ? "Connected" : "Disconnected"}</p>
           {isConnected ?
             <div>
              <input value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder={"Enter Move"} />
              <button onClick={handleSendMessage}>Send</button>
             </div>
           : null}
        </div>
    );
};

export default GameControls;