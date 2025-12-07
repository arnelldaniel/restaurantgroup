import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { UserContext } from './UserContext';
import LogoutButton from './LogoutButton';

// Floating blob animation for hero
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

const Page = styled.div`
  width: 100%;
  min-height: 100vh;
  padding: 50px 80px;
  background: linear-gradient(135deg, #f9f9fb, #e3f2fd);
  font-family: 'Arial', sans-serif;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) { padding: 40px 30px; }
  @media (max-width: 480px) { padding: 30px 20px; }
`;

const BackgroundBlob = styled.div`
  position: absolute;
  width: 500px;
  height: 500px;
  background: #d1c4e9;
  border-radius: 50%;
  top: -100px;
  left: -150px;
  opacity: 0.3;
  animation: ${float} 8s ease-in-out infinite;
  z-index: 0;
`;

const Header = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 40px;
  position: relative;
  z-index: 1;
`;

const Hero = styled.div`
  text-align: center;
  margin-bottom: 50px;
  position: relative;
  z-index: 1;
`;

const Title = styled.h1`
  font-size: 4rem;
  margin-bottom: 20px;
  color: #3a3a3a;
  letter-spacing: 1px;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);

  @media (max-width: 768px) { font-size: 3rem; }
  @media (max-width: 480px) { font-size: 2.2rem; }
`;

const Subtitle = styled.p`
  font-size: 1.6rem;
  color: #555;
  margin-bottom: 40px;
  line-height: 1.6;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) { font-size: 1.3rem; }
  @media (max-width: 480px) { font-size: 1.1rem; }
`;

const Card = styled.div`
  background: linear-gradient(145deg, #ffffff, #f1f6f9);
  padding: 45px 35px;
  border-radius: 24px;
  box-shadow: 0 12px 35px rgba(0,0,0,0.12);
  margin-bottom: 30px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 18px 50px rgba(0,0,0,0.15);
  }
`;

const Greeting = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  color: #222;
  margin-bottom: 30px;
  text-align: center;
`;

const Nav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
`;

const NavLink = styled(Link)`
  padding: 15px 25px;
  background: linear-gradient(135deg, #6c63ff, #007bff);
  color: white;
  border-radius: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  min-width: 150px;
  text-align: center;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);

  &:hover {
    background: linear-gradient(135deg, #3f3dff, #0056b3);
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  }

  @media (max-width: 480px) {
    padding: 12px 20px;
    font-size: 0.95rem;
  }
`;

export default function HomePage() {
  const { user } = useContext(UserContext);

  return (
    <Page>
      <BackgroundBlob />
      <Header>{user && <LogoutButton />}</Header>

      <Hero>
        <Title>Welcome to FoodReviews!</Title>
        <Subtitle>Discover restaurants, read reviews, and share your experiences.</Subtitle>
      </Hero>

      {user ? (
        <Card>
          <Greeting>Hello, {user.username || user.email || 'User'}!</Greeting>
          <Nav>
            <NavLink to="/search">Search Restaurants</NavLink>
          </Nav>
        </Card>
      ) : (
        <Card>
          <Nav>
            <NavLink to="/register">User Sign Up</NavLink>
            <NavLink to="/login">User Login</NavLink>
            <NavLink to="/admin/login">Admin Login</NavLink>
            <NavLink to="/moderator/login">Moderator Login</NavLink>
          </Nav>
        </Card>
      )}
    </Page>
  );
}
