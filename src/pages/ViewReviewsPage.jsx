import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { supabase } from "./supabaseClient";
import { UserContext } from "./UserContext";
import LogoutButton from "./LogoutButton";

// ----------------- STYLES -----------------

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
  margin-bottom: 20px;
  border-bottom: 2px solid #007bff;
  padding-bottom: 8px;
  text-align: center;
  color: #343a40;

  @media (max-width: 768px) {
    font-size: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

const FilterRow = styled.div`
  margin-bottom: 20px;

  select {
    padding: 8px;
    border-radius: 6px;
    border: 1px solid #ccc;
  }
`;

const ReviewList = styled.ul`
  list-style: none;
  padding: 0;
`;

const ReviewCard = styled.li`
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const Username = styled.strong`
  font-size: 16px;
`;

const Rating = styled.div`
  font-size: 18px;
  color: #ffb400;
  margin: 6px 0;
`;

const ReviewText = styled.p`
  margin: 8px 0;
  font-size: 15px;
`;

const DateText = styled.p`
  font-size: 0.85em;
  color: #666;
  margin-bottom: 10px;
`;

const ButtonsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 10px 0;

  button {
    padding: 6px 10px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    background: #007bff;
    color: white;
    font-size: 14px;
    transition: 0.2s;

    &:hover {
      opacity: 0.85;
    }
  }

  button.delete {
    background: #dc3545;

    &:hover {
      opacity: 0.85;
    }
  }

  button.report {
    background: #6c757d;

    &:hover {
      opacity: 0.85;
    }
  }
`;

const CommentInput = styled.input`
  width: 70%;
  padding: 8px;
  margin-top: 6px;
  border-radius: 6px;
  border: 1px solid #ccc;
`;

const CommentButton = styled.button`
  padding: 7px 12px;
  margin-left: 6px;
  border: none;
  border-radius: 6px;
  background: #28a745;
  color: white;
  cursor: pointer;
`;

const CommentList = styled.ul`
  list-style: none;
  padding-left: 15px;
  margin-top: 10px;
`;

const CommentItem = styled.li`
  background: #f9f9f9;
  padding: 10px 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
`;

const ReportedTag = styled.span`
  color: red;
  margin-left: 6px;
`;

// ---------------------------------------------------------

export default function ViewReviewsPage() {
  const { id } = useParams();
  const { user } = useContext(UserContext);
  const CURRENT_USER_ID = user?.id;

  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOption, setFilterOption] = useState("date");

  const fetchRestaurant = async () => {
    const { data } = await supabase
      .from("restaurants")
      .select("name")
      .eq("id", id)
      .single();
    if (data) setRestaurant(data);
  };

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
        id,
        rating,
        user_id,  
        comment,
        helpful_count,
        unhelpful_count,
        reported,
        approved,
        created_at,
        user:users(id, username),
        comments(
          id,
          comment,
          reported,
          user:users(username)
        )
      `
      )
      .eq("restaurant_id", id)
      .eq("approved", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setReviews(
        data.map((r) => ({ ...r, comments: r.comments || [], newComment: "" }))
      );
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchRestaurant();
    fetchReviews();
  }, [id]);

  const filteredReviews = [...reviews].sort((a, b) => {
    switch (filterOption) {
      case "rating_high":
        return b.rating - a.rating;
      case "rating_low":
        return a.rating - b.rating;
      case "helpful":
        return b.helpful_count - a.helpful_count;
      default:
        return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  const voteReview = async (reviewId, type) => {
    if (!CURRENT_USER_ID) return alert("You must be logged in to vote.");

    const { data: existingVote } = await supabase
      .from("review_votes")
      .select("*")
      .eq("review_id", reviewId)
      .eq("user_id", CURRENT_USER_ID)
      .maybeSingle();

    if (existingVote) {
      alert("You already voted on this review.");
      return;
    }

    await supabase
      .from("review_votes")
      .insert([
        { review_id: reviewId, user_id: CURRENT_USER_ID, vote_type: type },
      ]);

    const review = reviews.find((r) => r.id === reviewId);
    const updatedCounts =
      type === "helpful"
        ? { helpful_count: review.helpful_count + 1 }
        : { unhelpful_count: review.unhelpful_count + 1 };

    await supabase.from("reviews").update(updatedCounts).eq("id", reviewId);
    fetchReviews();
  };

  const reportReview = async (reviewId) => {
    await supabase
      .from("reviews")
      .update({ reported: true })
      .eq("id", reviewId);
    fetchReviews();
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete your review?")) return;
    await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId)
      .eq("user_id", CURRENT_USER_ID);
    fetchReviews();
  };

  const reportComment = async (commentId) => {
    await supabase
      .from("comments")
      .update({ reported: true })
      .eq("id", commentId);
    fetchReviews();
  };

  const setReviewComment = (reviewId, text) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, newComment: text } : r))
    );
  };

  const addComment = async (e, reviewId) => {
    e.preventDefault();
    if (!CURRENT_USER_ID)
      return alert("You must be logged in to post a comment.");
    const review = reviews.find((r) => r.id === reviewId);
    if (!review.newComment.trim()) return alert("Comment cannot be empty.");

    await supabase.from("comments").insert([
      {
        review_id: reviewId,
        user_id: CURRENT_USER_ID,
        comment: review.newComment.trim(),
        reported: false,
      },
    ]);

    setReviewComment(reviewId, "");
    fetchReviews();
  };

  return (
    <Container>
      <HeaderRow>
        <LogoutButton />
      </HeaderRow>

      <Title>Reviews for {restaurant ? restaurant.name : "Restaurant"}</Title>

      <FilterRow>
        <label>Sort Reviews:&nbsp;</label>
        <select
          value={filterOption}
          onChange={(e) => setFilterOption(e.target.value)}
        >
          <option value="date">Newest First</option>
          <option value="rating_high">Rating: High → Low</option>
          <option value="rating_low">Rating: Low → High</option>
          <option value="helpful">Most Helpful</option>
        </select>
      </FilterRow>

      {loading && <p>Loading reviews...</p>}
      {!loading && reviews.length === 0 && <p>No reviews yet.</p>}

      <ReviewList>
        {filteredReviews.map((r) => (
          <ReviewCard key={r.id}>
            <Username>{r.user.username}</Username>

            <Rating>
              {"★".repeat(r.rating)}
              {"☆".repeat(5 - r.rating)}
            </Rating>

            <ReviewText>{r.comment}</ReviewText>

            <DateText>
              Posted on {new Date(r.created_at).toLocaleDateString()}
            </DateText>

            <div>
              Helpful: {r.helpful_count} | Unhelpful: {r.unhelpful_count}
            </div>

            <ButtonsRow>
              <button onClick={() => voteReview(r.id, "helpful")}>
                Helpful
              </button>
              <button onClick={() => voteReview(r.id, "unhelpful")}>
                Unhelpful
              </button>
              <button className="report" onClick={() => reportReview(r.id)}>
                Report
              </button>

              {r.user_id === CURRENT_USER_ID && (
                <button className="delete" onClick={() => deleteReview(r.id)}>
                  Delete Review
                </button>
              )}
            </ButtonsRow>

            <form onSubmit={(e) => addComment(e, r.id)}>
              <CommentInput
                type="text"
                placeholder="Write a comment..."
                value={r.newComment || ""}
                onChange={(e) => setReviewComment(r.id, e.target.value)}
              />
              <CommentButton type="submit">Post</CommentButton>
            </form>

            <CommentList>
              {r.comments.map((c) => (
                <CommentItem key={c.id}>
                  <strong>{c.user.username}</strong>: {c.comment}
                  {!c.reported ? (
                    <button
                      className="report"
                      style={{ marginLeft: "6px", padding: "3px 6px" }}
                      onClick={() => reportComment(c.id)}
                    >
                      Report
                    </button>
                  ) : (
                    <ReportedTag>Reported</ReportedTag>
                  )}
                </CommentItem>
              ))}
            </CommentList>
          </ReviewCard>
        ))}
      </ReviewList>
    </Container>
  );
}
