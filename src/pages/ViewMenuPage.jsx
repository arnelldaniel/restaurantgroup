import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { supabase } from "./supabaseClient";
import LogoutButton from "./LogoutButton";

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  padding: 60px 80px;
  box-sizing: border-box;
  font-family: "Arial", sans-serif;
  background-color: #f8f9fa;

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

const HeaderRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 30px;
`;

const Title = styled.h2`
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 30px;
  color: #343a40;

  @media (max-width: 768px) {
    font-size: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

const BackButton = styled.button`
  padding: 12px 18px;
  margin-bottom: 25px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:hover {
    background-color: #5a6268;
  }
`;

const MenuList = styled.ul`
  list-style: none;
  padding: 0;
`;

const MenuItem = styled.li`
  padding: 15px 18px;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 12px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.05);

  strong {
    color: #007bff;
    font-size: 1.1rem;
  }

  p {
    margin: 5px 0 0 0;
    color: #495057;
    font-size: 0.95rem;
  }
`;

export default function ViewMenuPage() {
  const { id } = useParams(); // restaurant id
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: restaurantData, error: restaurantError } = await supabase
        .from("restaurants")
        .select("name")
        .eq("id", id)
        .single();

      if (!restaurantError) setRestaurant(restaurantData);

      const { data: menuData } = await supabase
        .from("menu_items")
        .select("*")
        .eq("restaurant_id", id);

      if (menuData) setMenuItems(menuData);

      setLoading(false);
    };

    fetchData();
  }, [id]);

  return (
    <Container>
      <HeaderRow>
        <LogoutButton />
      </HeaderRow>

      <Title>Menu for {restaurant ? restaurant.name : "Restaurant"}</Title>

      <BackButton onClick={() => window.history.back()}>
        Back to Restaurant Details
      </BackButton>

      {loading && <p>Loading menu...</p>}
      {!loading && menuItems.length === 0 && <p>No menu items found.</p>}

      <MenuList>
        {menuItems.map((item) => (
          <MenuItem key={item.id}>
            <strong>{item.name}</strong> - £{item.price.toFixed(2)}
            <p>{item.description}</p>
          </MenuItem>
        ))}
      </MenuList>
    </Container>
  );
}
