import React, { useState, useEffect, useContext } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import styled from "styled-components";
import { FaCheck, FaTimes, FaShieldAlt } from "react-icons/fa";
import LogoutButton from "./LogoutButton";
import AdminNavbar from "./AdminNavbar";

/* ================== STYLES ================== */

const Container = styled.div`
  display: flex;
  gap: 30px;
  padding: 40px 60px;
  font-family: Arial, sans-serif;
  min-height: 100vh;
  background-color: #f0f4f8;

  @media (max-width: 1024px) {
    flex-direction: column;
    padding: 30px 40px;
  }
`;

const Column = styled.div`
  flex: 1;
`;

const PageTitle = styled.h2`
  font-size: 36px;
  margin-bottom: 20px;
  color: #343a40;
`;

const AlertBanner = styled.div`
  background: #dc3545;
  color: white;
  padding: 14px 18px;
  border-radius: 10px;
  font-weight: bold;
  margin-bottom: 25px;
`;

const SectionTitle = styled.h3`
  margin-top: 40px;
  margin-bottom: 20px;
  color: #495057;
`;

const Card = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  padding: 20px 25px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

const RestaurantName = styled.span`
  font-weight: bold;
  font-size: 16px;
`;

const ReviewText = styled.p`
  margin: 5px 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const Button = styled.button`
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: white;
  background-color: ${(p) =>
    p.variant === "delete"
      ? "#dc3545"
      : p.variant === "approve"
      ? "#28a745"
      : "#007bff"};
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
`;

/* ================== PAGE ================== */

export default function ModerationPage() {
  const [pendingReviews, setPendingReviews] = useState([]);
  const [reportedReviews, setReportedReviews] = useState([]);
  const [pendingComments, setPendingComments] = useState([]);
  const [reportedComments, setReportedComments] = useState([]);
  const [approvedReviews, setApprovedReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "moderator")) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);

    const { data: pendingRev } = await supabase
      .from("reviews")
      .select("id, comment, restaurants(name), approved, reported")
      .eq("approved", false);

    const { data: reportedRev } = await supabase
      .from("reviews")
      .select("id, comment, restaurants(name), approved, reported")
      .eq("reported", true);

    const { data: pendingCom } = await supabase
      .from("comments")
      .select("id, comment, reviews(restaurants(name)), approved, reported")
      .eq("approved", false);

    const { data: reportedCom } = await supabase
      .from("comments")
      .select("id, comment, reviews(restaurants(name)), approved, reported")
      .eq("reported", true);

    const { data: approvedRev } = await supabase
      .from("reviews")
      .select("id, comment, restaurants(name), response")
      .eq("approved", true);

    setPendingReviews(pendingRev || []);
    setReportedReviews(reportedRev || []);
    setPendingComments(pendingCom || []);
    setReportedComments(reportedCom || []);
    setApprovedReviews((approvedRev || []).map(r => ({ ...r, responseText: "" })));

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const hasAlerts =
    pendingReviews.length > 0 ||
    pendingComments.length > 0 ||
    reportedReviews.length > 0 ||
    reportedComments.length > 0;

  const approve = async (table, id) => {
    await supabase.from(table).update({ approved: true }).eq("id", id);
    fetchData();
  };

  const reject = async (table, id) => {
    await supabase.from(table).delete().eq("id", id);
    fetchData();
  };

  const renderCard = (item, table) => (
    <Card key={item.id}>
      <CardHeader>
        <RestaurantName>
          {item.restaurants?.name || item.reviews?.restaurants?.name}
        </RestaurantName>
      </CardHeader>

      <ReviewText>{item.comment}</ReviewText>

      <ButtonGroup>
        <Button variant="approve" onClick={() => approve(table, item.id)}>
          <FaCheck /> Approve
        </Button>
        <Button variant="delete" onClick={() => reject(table, item.id)}>
          <FaTimes /> Delete
        </Button>
      </ButtonGroup>
    </Card>
  );

  return (
    <>
      {user?.role === "admin" && <AdminNavbar />}

      <Container>
        <Column>
          {user?.role === "moderator" && <LogoutButton />}

          <PageTitle>Moderation Dashboard</PageTitle>

          {hasAlerts && (
            <AlertBanner>
              ⚠️ New reviews or comments require moderation
            </AlertBanner>
          )}

          {loading && <p>Loading...</p>}

          <SectionTitle>Pending Reviews</SectionTitle>
          {pendingReviews.map(r => renderCard(r, "reviews"))}

          <SectionTitle>Reported Reviews</SectionTitle>
          {reportedReviews.map(r => renderCard(r, "reviews"))}

          <SectionTitle>Pending Comments</SectionTitle>
          {pendingComments.map(c => renderCard(c, "comments"))}

          <SectionTitle>Reported Comments</SectionTitle>
          {reportedComments.map(c => renderCard(c, "comments"))}
        </Column>

        <Column>
          <PageTitle>Approved Reviews</PageTitle>
          {approvedReviews.map(r => renderCard(r, "reviews"))}
        </Column>
      </Container>
    </>
  );
}
