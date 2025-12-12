import React, { useState, useContext } from "react";
import styled from "styled-components";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  padding: 60px 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  box-sizing: border-box;
  font-family: "Arial", sans-serif;

  @media (max-width: 1024px) {
    padding: 50px 40px;
  }

  @media (max-width: 768px) {
    padding: 40px 30px;
  }

  @media (max-width: 480px) {
    padding: 30px 20px;
  }
`;

const Title = styled.h2`
  font-size: 3rem;
  color: #343a40;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }

  @media (max-width: 480px) {
    font-size: 2rem;
  }
`;

const Form = styled.form`
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 16px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
  }
`;

const Button = styled.button`
  padding: 14px;
  background-color: #007bff;
  color: white;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background-color: #0056b3;
  }
`;

const FormFooter = styled.div`
  margin-top: 20px;
  text-align: center;
  font-size: 16px;
  color: #495057;
`;

const RegisterLink = styled.a`
  display: inline-block;
  padding: 10px 18px;
  margin-top: 5px;
  background-color: #28a745;
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    background-color: #218838;
  }
`;

const HomeButton = styled.button`
  margin-top: 15px;
  padding: 12px 20px;
  background-color: #6c757d;
  color: white;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background-color: #5a6268;
  }
`;

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) return alert("Fill all fields");

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !data) return alert("User not found");

    if (data.suspended) return alert("Your account is suspended. Please contact admin.");

    if (password === data.password) {
      setUser(data);
      alert("Login successful!");
      navigate("/search");
    } else {
      alert("Incorrect password");
    }
  };

  return (
    <Container>
      <Title>Login</Title>
      <Form onSubmit={handleLogin}>
        <Input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit">Login</Button>
      </Form>

      <FormFooter>
        Don't have an account? <RegisterLink href="/register">Register</RegisterLink>
      </FormFooter>

      <HomeButton onClick={() => navigate("/")}>Go Back Home</HomeButton>
    </Container>
  );
}
