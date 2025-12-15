import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { UserContext } from './UserContext';
import LogoutButton from './LogoutButton';

// ===============================
// **FULL REAL-WEBSITE PROFESSIONAL REDESIGN**
// Clean, premium, modern landing-page layout
// Hero with two-column structure, illustration panel, depth layers, polished UI
// ===============================

const Page = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #f5f7fa;
  font-family: 'Inter', sans-serif;
  display: flex;
  justify-content: center;
  padding: 0 20px;
`;

const Container = styled.div`
  width: 100%;
  max-width: 1300px;
  display: flex;
  flex-direction: column;
  padding: 40px 0 80px 0;
`;

// HEADER -----------------------

const Header = styled.header`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
`;

const Logo = styled.div`
  font-size: 1.9rem;
  font-weight: 800;
  color: #222;
`;

// HERO SECTION -----------------

const Hero = styled.section`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  margin-top: 60px;
  align-items: center;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

const HeroText = styled.div``;

const Title = styled.h1`
  font-size: 3.8rem;
  font-weight: 800;
  line-height: 1.1;
  color: #0f1115;
  margin-bottom: 20px;

  @media (max-width: 900px) {
    font-size: 3rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  color: #4d525a;
  line-height: 1.7;
  max-width: 520px;
  margin-bottom: 32px;

  @media (max-width: 900px) {
    margin: 0 auto 32px auto;
  }
`;

const CTAButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16px 26px;
  background: #3d63ff;
  color: #fff;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 8px 26px rgba(61,99,255,0.25);
  transition: 0.25s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 36px rgba(61,99,255,0.35);
  }
`;

// HERO IMAGE -------------------

const HeroImageWrapper = styled.div`
  width: 100%;
  height: 420px;
  border-radius: 22px;
  background: linear-gradient(135deg, #cfd9ff, #fff 60%);
  box-shadow: 0 20px 50px rgba(0,0,0,0.08);
  position: relative;
  overflow: hidden;

  @media (max-width: 900px) {
    height: 320px;
  }
`;

const IllustrationPlaceholder = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  color: #6e77a3;
  opacity: 0.45;
`;

// CARD SECTION -----------------

const Card = styled.div`
  margin: 70px auto 0 auto;
  width: 100%;
  max-width: 780px;
  background: #ffffff;
  padding: 45px 40px;
  border-radius: 20px;
  box-shadow: 0 18px 50px rgba(0,0,0,0.08);
  border: 1px solid #ececec;
`;

const Greeting = styled.div`
  text-align: center;
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 30px;
`;

const Nav = styled.nav`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 22px;
`;

const NavLink = styled(Link)`
  padding: 16px;
  background: #f5f7ff;
  color: #333;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  text-align: center;
  border: 1px solid #e0e6ff;
  transition: 0.25s;

  &:hover {
    background: #3d63ff;
    color: #fff;
    border-color: transparent;
    transform: translateY(-3px);
    box-shadow: 0 16px 32px rgba(61,99,255,0.25);
  }
`;

export default function HomePage() {
  const { user } = useContext(UserContext);

  return (
    <Page>
      <Container>
        <Header>
          <Logo>FoodReviews</Logo>
          {user && <LogoutButton />}
        </Header>

        <Hero>
          <HeroText>
            <Title>Find the best restaurants near you</Title>
            <Subtitle>
              Browse curated listings, read trusted reviews, and share your own dining experiences — all on a clean, modern platform.
            </Subtitle>
            
          </HeroText>

          <HeroImageWrapper>
            <IllustrationPlaceholder>
              <img src='https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80


'/>
            </IllustrationPlaceholder>
          </HeroImageWrapper>
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
            <Greeting>Get Started</Greeting>
            <Nav>
              <NavLink to="/register">User Sign Up</NavLink>
              <NavLink to="/login">User Login</NavLink>
              <NavLink to="/admin/login">Admin Login</NavLink>
              <NavLink to="/moderator/login">Moderator Login</NavLink>
            </Nav>
          </Card>
        )}
      </Container>
    </Page>
  );
}
