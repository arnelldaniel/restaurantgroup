import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { supabase } from "./supabaseClient";
import { Link } from "react-router-dom";
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
  margin-bottom: 25px;
`;

const PageTitle = styled.h2`
  font-size: 3rem;
  margin-bottom: 25px;
  color: #343a40;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }

  @media (max-width: 480px) {
    font-size: 2rem;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 14px 16px;
  margin-bottom: 30px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 16px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 6px rgba(0, 123, 255, 0.3);
  }

  @media (max-width: 480px) {
    font-size: 14px;
    padding: 12px 14px;
  }
`;

const RestaurantList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const RestaurantCard = styled.div`
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const CardImage = styled.img`
  width: 100%;
  max-height: 300px;
  object-fit: cover;
`;

const CardBody = styled.div`
  padding: 20px;
`;

const Title = styled.h3`
  font-size: 1.8rem;
  margin: 0 0 10px 0;
  color: #343a40;
`;

const Description = styled.p`
  font-size: 1rem;
  margin: 5px 0;
  line-height: 1.5;
  color: #495057;
`;

const InfoText = styled.p`
  font-size: 0.95rem;
  margin: 3px 0;
  color: #495057;
`;

const RatingText = styled.p`
  font-size: 1rem;
  margin: 5px 0;
  font-weight: 500;
`;

const ReviewsCount = styled.span`
  font-size: 0.85rem;
  color: #555;
  margin-left: 5px;
`;

const CuisineBadge = styled.span`
  display: inline-block;
  background-color: #007bff;
  color: white;
  font-size: 0.85rem;
  padding: 5px 12px;
  border-radius: 20px;
  text-transform: capitalize;
  margin-top: 5px;
`;

const DetailsLink = styled(Link)`
  display: inline-block;
  margin-top: 12px;
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.2s ease;

  &:hover {
    background-color: #218838;
  }
`;

export default function SearchRestaurantsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRestaurants = async () => {
    setLoading(true);

    let query = supabase.from("restaurants").select(`*, reviews(rating)`);

    if (searchTerm) {
      query = query.or(
        `name.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,cuisine.ilike.%${searchTerm}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      alert("Error fetching restaurants: " + error.message);
    } else {
      const restaurantsWithAvg = data.map((r) => {
        const ratings = r.reviews.map((rev) => rev.rating);
        const avgRating =
          ratings.length > 0
            ? (ratings.reduce((sum, val) => sum + val, 0) / ratings.length).toFixed(1)
            : "No reviews";
        const reviewCount = ratings.length;
        return { ...r, avgRating, reviewCount };
      });

      setRestaurants(restaurantsWithAvg);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchRestaurants();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  return (
    <Container>
      <HeaderRow>
        <LogoutButton />
      </HeaderRow>

      <PageTitle>Search Restaurants</PageTitle>

      <SearchInput
        type="text"
        placeholder="Search by name, location, or cuisine"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {loading && <p>Loading...</p>}
      {!loading && restaurants.length === 0 && <p>No restaurants found.</p>}

      <RestaurantList>
        {restaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id}>
            {restaurant.image_url && <CardImage src={restaurant.image_url} alt={restaurant.name} />}
            <CardBody>
              <Title>{restaurant.name}</Title>
              <CuisineBadge>{restaurant.cuisine}</CuisineBadge>
              <Description>{restaurant.description}</Description>
              <InfoText><strong>Location:</strong> {restaurant.location}</InfoText>
              <RatingText>
                <strong>Average Rating:</strong> {restaurant.avgRating}
                {restaurant.reviewCount > 0 && <ReviewsCount>({restaurant.reviewCount} reviews)</ReviewsCount>}
              </RatingText>
              <DetailsLink to={`/restaurant/${restaurant.id}`}>View Details</DetailsLink>
            </CardBody>
          </RestaurantCard>
        ))}
      </RestaurantList>
    </Container>
  );
}
