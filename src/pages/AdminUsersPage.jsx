import React, { useState, useEffect, useContext } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import styled from "styled-components";
import AdminNavbar from "./AdminNavbar";
import { FaTrash, FaUserSlash, FaUserCheck } from "react-icons/fa";

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  padding: 40px 60px;
  font-family: Arial, sans-serif;
  background-color: #f0f4f8;
  box-sizing: border-box;

  @media (max-width: 1024px) { padding: 30px 40px; }
  @media (max-width: 768px) { padding: 20px 25px; }
  @media (max-width: 480px) { padding: 15px 15px; }
`;

const PageTitle = styled.h2`
  font-size: 36px;
  margin-bottom: 30px;
  color: #343a40;
`;

const UsersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
`;

const UserCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
  background: #fff;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
`;

const Username = styled.span`
  font-weight: bold;
  font-size: 16px;
  color: #212529;
`;

const CreatedAt = styled.span`
  font-size: 14px;
  color: #555;
`;

const StatusBadge = styled.span`
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  color: white;
  background-color: ${(props) => (props.suspended ? "#dc3545" : "#28a745")};
  margin-right: 15px;
`;

const Button = styled.button`
  padding: 8px 12px;
  margin-left: 5px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: white;
  display: flex;
  align-items: center;
  margin-top: 5px;

  background-color: ${(props) =>
    props.variant === "delete"
      ? "#dc3545"
      : props.variant === "suspend"
      ? "#ffc107"
      : "#007bff"};

  &:hover {
    opacity: 0.85;
    transform: translateY(-1px);
  }

  svg {
    margin-right: 5px;
  }
`;

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("users").select("*");
    if (error) console.error("Error fetching users:", error);
    else setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) console.error("Delete error:", error);
    else fetchUsers();
  };

  const handleSuspend = async (id) => {
    const selectedUser = users.find((u) => u.id === id);
    const { error } = await supabase
      .from("users")
      .update({ suspended: !selectedUser.suspended })
      .eq("id", id);
    if (error) console.error("Suspend error:", error);
    else fetchUsers();
  };

  return (
    <>
      <AdminNavbar />
    <Container>
      
      <PageTitle>Admin Panel: Manage Users</PageTitle>
      
      {loading && <p>Loading users...</p>}
      {!loading && users.length === 0 && <p>No users found.</p>}

      <UsersList>
        {!loading &&
          users.map((u) => (
            <UserCard key={u.id}>
              <UserInfo>
                <Username>{u.username}</Username>
                <CreatedAt>{new Date(u.created_at).toLocaleString()}</CreatedAt>
              </UserInfo>
              <StatusBadge suspended={u.suspended}>
                {u.suspended ? "Suspended" : "Active"}
              </StatusBadge>
              <div>
                <Button variant="suspend" onClick={() => handleSuspend(u.id)}>
                  {u.suspended ? <FaUserCheck /> : <FaUserSlash />}
                  {u.suspended ? "Reactivate" : "Suspend"}
                </Button>
                <Button variant="delete" onClick={() => handleDelete(u.id)}>
                  <FaTrash /> Delete
                </Button>
              </div>
            </UserCard>
          ))}
      </UsersList>
    </Container>
    </>
  );
}
