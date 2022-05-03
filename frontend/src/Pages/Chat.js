import React, { useRef, useState } from "react";
import styled from "styled-components";
import { io } from "socket.io-client";
import { Welcome } from "../Import/Index";

export default function Chat() {
  const [contacts, setContacts] = useState([]);
  const socket = useRef();
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);
  const handleChatChange = () => {};
  return (
    <>
      <Container>
        <div className="container">
          {currentChat === undefined ? (
            <Welcome />
          ) : (
            // <ChatContainer currentChat={currentChat} socket={socket} />
            ""
          )}
        </div>
      </Container>
    </>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;
  .container {
    height: 85vh;
    width: 85vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;
