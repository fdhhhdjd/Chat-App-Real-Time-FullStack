import React from "react";
import { BiPowerOff } from "react-icons/bi";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { LogoutInitial } from "../Redux/AuthenticationSlice";
import { LogoutRoute } from "../utils/ApiRoutes";
export default function Logout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleClick = async () => {
    const id = await JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    )._id;
    dispatch(LogoutInitial({ LogoutRoute, id })).then((data) => {
      if (data?.payload?.status === true) {
        localStorage.clear();
        navigate("/login");
      }
    });
  };
  return (
    <Button onClick={handleClick}>
      <BiPowerOff />
    </Button>
  );
}

const Button = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background-color: #9a86f3;
  border: none;
  cursor: pointer;
  svg {
    font-size: 1.3rem;
    color: #ebe7ff;
  }
`;
