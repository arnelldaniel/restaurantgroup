import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { supabase } from "./supabaseClient";
import LogoutButton from "./LogoutButton";

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  padding: 40px 60px;
  box-sizing: border-box;
  font-family: "Arial", sans-serif;
  background-color: #f5f6fa;

  @media (max-width: 1024px) { padding: 35px 40px; }
  @media (max-width: 768px) { padding: 30px 25px; }
  @media (max-width: 480px) { padding: 20px 15px; }
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 30px;
  color: #2f3640;

  @media (max-width: 768px) { font-size: 2rem; }
  @media (max-width: 480px) { font-size: 1.8rem; }
`;

const BackButton = styled.button`
  padding: 10px 16px;
  margin-bottom: 25px;
  background-color: #718093;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.2s ease;

  &:hover { background-color: #636e72; }
`;

const MenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
`;

const MenuCard = styled.div`
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease;

  &:hover { transform: translateY(-3px); }
`;

const MenuImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const MenuContent = styled.div`
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  strong {
    font-size: 1.2rem;
    color: #192a56;
  }

  p {
    font-size: 1rem;
    color: #353b48;
    line-height: 1.4;
    margin: 0;
  }

  span {
    font-weight: bold;
    color: #e84118;
  }
`;

export default function ViewMenuPage() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: restaurantData } = await supabase
        .from("restaurants")
        .select("name")
        .eq("id", id)
        .single();
      if (restaurantData) setRestaurant(restaurantData);

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
      <HeaderRow><LogoutButton /></HeaderRow>
      <Title>Menu for {restaurant ? restaurant.name : "Restaurant"}</Title>
      <BackButton onClick={() => window.history.back()}>Back to Restaurant Details</BackButton>

      {loading && <p>Loading menu...</p>}
      {!loading && menuItems.length === 0 && <p>No menu items found.</p>}

      <MenuGrid>
        {menuItems.map((item) => (
          <MenuCard key={item.id}>
            {item.image_url ? (
              <MenuImage src={item.image_url} alt={item.name} />
            ) : (
              <MenuImage src="https://via.placeholder.com/400x200?text=No+Image" alt="No image" />
            )}
            <MenuContent>
              <strong>{item.name}</strong>
              <span>£{item.price.toFixed(2)}</span>
              <p>{item.description}</p>
            </MenuContent>
          </MenuCard>
        ))}
      </MenuGrid>
    </Container>
  );
}
