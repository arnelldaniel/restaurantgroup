import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import styled from "styled-components";
import { supabase } from "./supabaseClient";
import LogoutButton from "./LogoutButton";

// ---- Styled Components ----
const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  padding: 60px 80px;
  background-color: #f8f9fa;
  font-family: "Arial", sans-serif;
  box-sizing: border-box;
  overflow-x: hidden;

  @media (max-width: 1024px) { padding: 50px 40px; }
  @media (max-width: 768px) { padding: 40px 30px; }
  @media (max-width: 480px) { padding: 30px 20px; }
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between; /* left and right items */
  align-items: center;
  margin-bottom: 25px;
`;

const Image = styled.img`
  width: 100%;
  max-width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 20px;
  display: block;
  box-sizing: border-box;
`;

const Title = styled.h2`
  font-size: 32px;
  margin-bottom: 15px;
  border-bottom: 2px solid #007bff;
  padding-bottom: 5px;
`;

const Info = styled.p`
  margin: 8px 0;
  font-size: 18px;
`;

const ButtonRow = styled.div`
  margin-top: 25px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const Button = styled(Link)`
  padding: 12px 20px;
  background-color: ${(props) =>
    props.variant === "reviews"
      ? "#17a2b8"
      : props.variant === "submit"
      ? "#28a745"
      : props.variant === "back"
      ? "#6c757d"
      : "#007bff"};
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;

  &:hover {
    opacity: 0.87;
  }
`;

// ---------------------------------------------------------------

export default function RestaurantDetailsPage() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [averageRating, setAverageRating] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRestaurant = async () => {
    setLoading(true);

    const { data: restaurantData, error: restaurantError } = await supabase
      .from("restaurants")
      .select("*")
      .eq("id", id)
      .single();

    if (restaurantError) {
      alert("Error fetching restaurant: " + restaurantError.message);
      setLoading(false);
      return;
    }

    setRestaurant(restaurantData);

    const { data: reviewsData, error: reviewsError } = await supabase
      .from("reviews")
      .select("rating")
      .eq("restaurant_id", id)
      .eq("approved", true);

    if (reviewsError) {
      console.error("Error fetching reviews:", reviewsError);
      setAverageRating("No reviews");
    } else if (reviewsData.length === 0) {
      setAverageRating("No reviews");
    } else {
      const sum = reviewsData.reduce((acc, r) => acc + r.rating, 0);
      const avg = (sum / reviewsData.length).toFixed(1);
      setAverageRating(avg);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchRestaurant();
  }, [id]);

  if (loading)
    return (
      <PageContainer>
        <HeaderRow>
          <Button to="/search" variant="back">Back to Search</Button>
          <LogoutButton />
        </HeaderRow>
        <p>Loading...</p>
      </PageContainer>
    );

  if (!restaurant)
    return (
      <PageContainer>
        <HeaderRow>
          <Button to="/search" variant="back">Back to Search</Button>
          <LogoutButton />
        </HeaderRow>
        <p>Restaurant not found.</p>
      </PageContainer>
    );

  return (
    <PageContainer>
      <HeaderRow>
        <Button to="/search" variant="back">Back to Search</Button>
        <LogoutButton />
      </HeaderRow>

      {restaurant.image_url && (
        <Image src={restaurant.image_url} alt={restaurant.name} />
      )}

      <Title>{restaurant.name}</Title>

      <Info>
        <strong>Location:</strong> {restaurant.location}
      </Info>
      <Info>
        <strong>Cuisine:</strong> {restaurant.cuisine}
      </Info>
      <Info>
        <strong>Description:</strong> {restaurant.description}
      </Info>
      <Info>
        <strong>Average Rating:</strong> {averageRating}
      </Info>

      <ButtonRow>
        <Button to={`/restaurant/${restaurant.id}/menu`}>View Menu</Button>
        <Button to={`/restaurant/${restaurant.id}/reviews`} variant="reviews">
          View Reviews
        </Button>
      </ButtonRow>
    </PageContainer>
  );
}
