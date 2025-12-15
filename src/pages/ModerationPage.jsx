import React, { useState, useEffect, useContext } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import styled from "styled-components";
import { FaCheck, FaTimes, FaShieldAlt } from "react-icons/fa";
import LogoutButton from "./LogoutButton";
import AdminNavbar from "./AdminNavbar";

/* ================== LAYOUT ================== */

const Page = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f0f4f8;
  font-family: Arial, sans-serif;
`;

const Sidebar = styled.div`
  width: 240px;
  flex-shrink: 0;
`;

const Content = styled.div`
  flex: 1;
  padding: 40px 60px;
  box-sizing: border-box;

  @media (max-width: 1024px) { padding: 30px 40px; }
  @media (max-width: 768px) { padding: 20px 25px; }
  @media (max-width: 480px) { padding: 15px 15px; }
`;

const Columns = styled.div`
  display: flex;
  gap: 30px;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const Column = styled.div`
  flex: 1;
`;

/* ================== UI ================== */

const PageTitle = styled.h2`
  font-size: 36px;
  margin-bottom: 30px;
  color: #343a40;
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
  color: #212529;
`;

const ReviewText = styled.p`
  margin: 5px 0;
  color: #495057;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
`;

const Button = styled.button`
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: white;
  display: inline-flex;
  align-items: center;
  background-color: ${(props) =>
    props.variant === "delete"
      ? "#dc3545"
      : props.variant === "approve"
      ? "#28a745"
      : props.variant === "safe"
      ? "#007bff"
      : "#ffc107"};

  &:hover { opacity: 0.85; }

  svg { margin-right: 5px; }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
  margin-top: 6px;
  resize: vertical;
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
      .select("id, comment, response, restaurants(name), approved, reported")
      .eq("approved", false)
      .order("created_at", { ascending: false });
    setPendingReviews(pendingRev || []);

    const { data: reportedRev } = await supabase
      .from("reviews")
      .select("id, comment, response, restaurants(name), approved, reported")
      .eq("reported", true)
      .order("created_at", { ascending: false });
    setReportedReviews(reportedRev || []);

    const { data: pendingCom } = await supabase
      .from("comments")
      .select("id, comment, reviews(restaurants(name)), approved, reported")
      .eq("approved", false)
      .order("created_at", { ascending: false });
    setPendingComments(pendingCom || []);

    const { data: reportedCom } = await supabase
      .from("comments")
      .select("id, comment, reviews(restaurants(name)), approved, reported")
      .eq("reported", true)
      .order("created_at", { ascending: false });
    setReportedComments(reportedCom || []);

    const { data: approvedRev } = await supabase
      .from("reviews")
      .select("id, comment, response, restaurants(name), approved")
      .eq("approved", true)
      .order("created_at", { ascending: false });

    setApprovedReviews((approvedRev || []).map(r => ({ ...r, responseText: "" })));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const approve = async (table, id) => {
    await supabase.from(table).update({ approved: true }).eq("id", id);
    fetchData();
  };

  const reject = async (table, id) => {
    if (!window.confirm("Delete this item?")) return;
    await supabase.from(table).delete().eq("id", id);
    fetchData();
  };

  const removeReport = async (table, id) => {
    await supabase.from(table).update({ reported: false }).eq("id", id);
    fetchData();
  };

  const handleResponse = async (e, reviewId) => {
    e.preventDefault();
    const review = approvedReviews.find(r => r.id === reviewId);
    if (!review.responseText?.trim()) return;

    await supabase
      .from("reviews")
      .update({ response: review.responseText.trim() })
      .eq("id", reviewId);

    fetchData();
  };

  const renderCard = (item, table, isReported = false) => (
    <Card key={item.id}>
      <CardHeader>
        <RestaurantName>
          {item.restaurants?.name || item.reviews?.restaurants?.name || "Unknown"}
        </RestaurantName>
      </CardHeader>

      <ReviewText>{item.comment}</ReviewText>

      {item.response && (
        <ReviewText><strong>Company Response:</strong> {item.response}</ReviewText>
      )}

      <ButtonGroup>
        {!item.approved && !isReported && (
          <Button variant="approve" onClick={() => approve(table, item.id)}>
            <FaCheck /> Approve
          </Button>
        )}
        {isReported && (
          <Button variant="safe" onClick={() => removeReport(table, item.id)}>
            <FaShieldAlt /> Mark Safe
          </Button>
        )}
        <Button variant="delete" onClick={() => reject(table, item.id)}>
          <FaTimes /> Delete
        </Button>
      </ButtonGroup>

      {table === "reviews" && item.approved && (
        <form onSubmit={(e) => handleResponse(e, item.id)}>
          <Textarea
            placeholder="Write a company response..."
            value={item.responseText}
            onChange={(e) =>
              setApprovedReviews(prev => prev.map(r =>
                r.id === item.id ? { ...r, responseText: e.target.value } : r
              ))
            }
          />
          <Button type="submit" variant="approve" style={{ marginTop: "5px" }}>
            <FaCheck /> Post Response
          </Button>
        </form>
      )}
    </Card>
  );

  return (
    <Page>
      <Sidebar>
        <AdminNavbar />
      </Sidebar>

      <Content>
        <LogoutButton />
        <PageTitle>Moderation Dashboard</PageTitle>

        {loading && <p>Loading...</p>}

        <Columns>
          <Column>
            <SectionTitle>Pending Reviews</SectionTitle>
            {pendingReviews.map(r => renderCard(r, "reviews"))}

            <SectionTitle>Reported Reviews</SectionTitle>
            {reportedReviews.map(r => renderCard(r, "reviews", true))}

            <SectionTitle>Pending Comments</SectionTitle>
            {pendingComments.map(c => renderCard(c, "comments"))}

            <SectionTitle>Reported Comments</SectionTitle>
            {reportedComments.map(c => renderCard(c, "comments", true))}
          </Column>

          <Column>
            <SectionTitle>Approved Reviews</SectionTitle>
            {approvedReviews.map(r => renderCard(r, "reviews"))}
          </Column>
        </Columns>
      </Content>
    </Page>
  );
}
