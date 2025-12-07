import React, { useContext } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";

const Button = styled.button`
  padding: 10px 20px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: #c82333;
  }
`;

export default function LogoutButton() {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);           
    alert("Logged out!");    
    navigate("/login");     
  };

  return <Button onClick={handleLogout}>Logout</Button>;
}
