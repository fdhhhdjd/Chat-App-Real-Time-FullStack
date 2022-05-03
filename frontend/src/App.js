import React from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import { Chat, Login, Register, SetAvatar } from "./Import/Index";
import "./responsive.css";
function App() {
  return (
    <React.Fragment>
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/setAvatar" element={<SetAvatar />} />
      </Routes>
    </React.Fragment>
  );
}

export default App;
