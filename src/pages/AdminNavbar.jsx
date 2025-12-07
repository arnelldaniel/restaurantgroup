import React from "react";
import styled from "styled-components";
import { Link, useLocation } from "react-router-dom";

const Nav = styled.nav`
  background-color: #007bff;
  padding: 10px 20px;
  display: flex;
  gap: 20px;
  align-items: center;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-weight: ${(props) => (props.active ? "bold" : "normal")};

  &:hover {
    text-decoration: underline;
  }
`;

export default function AdminNavbar() {
  const location = useLocation();

  return (
    <Nav>
      <NavLink to="/admin/restaurants" active={location.pathname === "/admin/restaurants" ? 1 : 0}>
        Restaurants
      </NavLink>
      <NavLink to="/admin/users" active={location.pathname === "/admin/users" ? 1 : 0}>
        Users
      </NavLink>
      <NavLink to="/moderation" active={location.pathname === "/moderation" ? 1 : 0}>
        Moderation
      </NavLink>
    </Nav>
  );
}
