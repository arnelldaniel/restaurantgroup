import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { UserContext } from './UserContext';
import styled from 'styled-components';
import LogoutButton from './LogoutButton';

const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  padding: 60px 80px;
  box-sizing: border-box;
  background-color: #f8f9fa;
  font-family: 'Arial', sans-serif;

  @media (max-width: 1024px) { padding: 50px 40px; }
  @media (max-width: 768px) { padding: 40px 30px; }
  @media (max-width: 480px) { padding: 30px 20px; }
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 40px;
`;

const Title = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 30px;
  color: #343a40;

  @media (max-width: 768px) { font-size: 2rem; }
  @media (max-width: 480px) { font-size: 1.7rem; }
`;

const Label = styled.label`
  display: block;
  margin-top: 18px;
  font-size: 16px;
  font-weight: bold;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  margin-top: 8px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 15px;
  resize: none;
`;

const StarRow = styled.div`
  font-size: 36px;
  margin-top: 8px;
  cursor: pointer;
`;

const SubmitButton = styled.button`
  margin-top: 25px;
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 17px;
  cursor: pointer;
  font-weight: bold;

  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.7; cursor: not-allowed; }
`;

export default function SubmitReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [restaurant, setRestaurant] = useState(null);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);

  const CURRENT_USER_ID = user?.id;

  useEffect(() => {
    const fetchRestaurant = async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('name')
        .eq('id', id)
        .single();

      if (!error) setRestaurant(data);
    };

    fetchRestaurant();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!CURRENT_USER_ID) {
      alert('You must be logged in to submit a review.');
      return;
    }

    if (!comment.trim()) {
      alert('Comment cannot be empty.');
      return;
    }

    if (rating < 1 || rating > 5) {
      alert('Rating must be between 1 and 5.');
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('reviews')
      .insert([
        {
          restaurant_id: id,
          user_id: CURRENT_USER_ID,
          comment: comment.trim(),
          rating,
          helpful_count: 0,
          unhelpful_count: 0,
          reported: false,
          approved: false
        }
      ]);

    setLoading(false);

    if (error) {
      alert('Failed to submit review.');
      return;
    }

    alert('Review submitted! It will be visible once approved.');
    navigate(`/restaurant/${id}/reviews`);
  };

  return (
    <PageContainer>
      <HeaderRow>
        <LogoutButton />
      </HeaderRow>

      <Title>
        Submit Review for {restaurant ? restaurant.name : 'Loading...'}
      </Title>

      <form onSubmit={handleSubmit}>
        <Label>Review Comment:</Label>
        <TextArea
          placeholder="Write your review..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
        />

        <Label>Rating:</Label>
        <StarRow>
          {Array.from({ length: 5 }).map((_, index) => {
            const starValue = index + 1;
            return (
              <span
                key={index}
                onClick={() => setRating(starValue)}
                onMouseEnter={() => setHover(starValue)}
                onMouseLeave={() => setHover(0)}
                style={{
                  color: (hover || rating) >= starValue ? '#f5b301' : '#ccc',
                  marginRight: '6px'
                }}
              >
                ★
              </span>
            );
          })}
        </StarRow>

        <SubmitButton disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Review'}
        </SubmitButton>
      </form>
    </PageContainer>
  );
}
