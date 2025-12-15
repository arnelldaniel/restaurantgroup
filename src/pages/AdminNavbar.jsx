import React from "react";
import styled from "styled-components";
import { Link, useLocation } from "react-router-dom";

const NavWrapper = styled.header`
  position: sticky;
  top: 0;
  z-index: 1000;
  background: linear-gradient(135deg, #0d6efd, #0b5ed7);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const Nav = styled.nav`
  max-width: 1200px;
  margin: 0 auto;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Brand = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.5px;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 12px;
`;

const NavLink = styled(Link)`
  position: relative;
  padding: 8px 14px;
  border-radius: 8px;
  color: #ffffff;
  text-decoration: none;
  font-weight: ${(props) => (props.$active ? "600" : "500")};
  background-color: ${(props) => (props.$active ? "rgba(255,255,255,0.2)" : "transparent")};
  transition: background-color 0.2s ease, transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
    box-shadow: none;
  }

  &::after {
    content: "";
    position: absolute;
    left: 10px;
    right: 10px;
    bottom: 4px;
    height: 2px;
    background-color: #ffffff;
    border-radius: 2px;
    opacity: ${(props) => (props.$active ? 1 : 0)};
    transition: opacity 0.2s ease;
  }
`;

export default function AdminNavbar() {
  const location = useLocation();

  return (
    <NavWrapper>
      <Nav>
        <Brand>Admin Panel</Brand>
        <NavLinks>
          <NavLink
            to="/admin/restaurants"
            $active={location.pathname === "/admin/restaurants"}
          >
            Restaurants
          </NavLink>
          <NavLink
            to="/admin/users"
            $active={location.pathname === "/admin/users"}
          >
            Users
          </NavLink>
          <NavLink
            to="/moderation"
            $active={location.pathname === "/moderation"}
          >
            Moderation
          </NavLink>
        </NavLinks>
      </Nav>
    </NavWrapper>
  );
}
