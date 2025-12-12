import React, { useState, useEffect, useContext } from "react";
import styled from "styled-components";
import { supabase } from "./supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import AdminNavbar from "./AdminNavbar";
import { FaPencilAlt, FaTrash, FaPlus } from "react-icons/fa";
import LogoutButton from "./LogoutButton";

// ---- Full-page Container ----
const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  padding: 40px 60px;
  font-family: "Arial", sans-serif;
  background-color: #f0f4f8;
  box-sizing: border-box;

  @media (max-width: 1024px) { padding: 30px 40px; }
  @media (max-width: 768px) { padding: 20px 25px; }
  @media (max-width: 480px) { padding: 15px 15px; }
`;

// Page Title
const PageTitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const PageTitle = styled.h2`
  font-size: 36px;
  color: #343a40;
`;

// Form
const Form = styled.form`
  width: 100%;
  background: #ffffff;
  padding: 30px 25px;
  border-radius: 12px;
  margin-bottom: 40px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

// Form Title
const FormTitle = styled.h3`
  margin-bottom: 20px;
  font-size: 24px;
  color: #007bff;
  border-bottom: 2px solid #007bff;
  padding-bottom: 5px;
`;

// Input
const Input = styled.input`
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
  }
`;

// TextArea
const TextArea = styled.textarea`
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
  transition: all 0.2s ease;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
  }
`;

// Buttons
const Button = styled.button`
  padding: 10px 16px;
  margin: 5px 5px 0 0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: white;
  font-weight: 500;
  background-color: ${(props) =>
    props.variant === "delete"
      ? "#dc3545"
      : props.variant === "edit"
      ? "#ffc107"
      : props.variant === "add"
      ? "#28a745"
      : "#007bff"};

  &:hover {
    opacity: 0.85;
  }
`;

// Image preview
const ImagePreview = styled.img`
  max-width: 300px;
  border-radius: 12px;
  margin-top: 10px;
  border: 1px solid #ccc;
  object-fit: cover;
`;

// Restaurant Card
const RestaurantCard = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  width: 100%;
`;

// Card Header
const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
`;

// Cuisine Badge
const CuisineBadge = styled.span`
  background-color: #007bff;
  color: white;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 20px;
  text-transform: capitalize;
`;

// Card Body
const CardBody = styled.div`
  padding: 15px;
`;

// Card Image
const CardImage = styled.img`
  width: 100%;
  max-height: 350px;
  object-fit: cover;
  border-bottom: 1px solid #e0e0e0;
`;

// Card Text
const Title = styled.h4`
  font-size: 22px;
  margin: 0 0 8px 0;
`;

const Description = styled.p`
  font-size: 16px;
  margin: 5px 0;
  line-height: 1.5;
`;

const InfoText = styled.p`
  font-size: 15px;
  margin: 3px 0;
  line-height: 1.4;
`;

const RatingText = styled.p`
  font-size: 15px;
  margin: 5px 0;
  font-weight: 500;
`;

// ---- Component ----
export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false); // toggle form
  const [newRestaurant, setNewRestaurant] = useState({
    name: "",
    location: "",
    cuisine: "",
    description: "",
    contact: "",
    imageFile: null,
    image_url: "",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const fetchRestaurants = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("restaurants").select(`*, reviews(rating)`);
    if (error) console.error(error);
    else {
      const restaurantsWithReviews = data.map((r) => {
        const ratings = r.reviews.map((rev) => rev.rating);
        const avgRating =
          ratings.length > 0
            ? (ratings.reduce((sum, val) => sum + val, 0) / ratings.length).toFixed(1)
            : "No reviews";
        const reviewCount = ratings.length;
        return { ...r, avgRating, reviewCount };
      });
      setRestaurants(restaurantsWithReviews);
    }
    setLoading(false);
  };

  useEffect(() => { fetchRestaurants(); }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRestaurant((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) setNewRestaurant((prev) => ({ ...prev, imageFile: e.target.files[0] }));
  };

  const uploadImage = async (file) => {
    const fileName = `${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("restaurant-images").upload(fileName, file);
    if (uploadError) { console.error(uploadError); return null; }
    const { data: { publicUrl } } = supabase.storage.from("restaurant-images").getPublicUrl(fileName);
    return publicUrl;
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    if (!newRestaurant.name || !newRestaurant.location || !newRestaurant.cuisine)
      return alert("Please fill in all required fields.");

    let imageUrl = newRestaurant.image_url;
    if (newRestaurant.imageFile) {
      const uploadedUrl = await uploadImage(newRestaurant.imageFile);
      if (!uploadedUrl) return alert("Failed to upload image.");
      imageUrl = uploadedUrl;
    }

    const restaurantData = {
      name: newRestaurant.name,
      location: newRestaurant.location,
      cuisine: newRestaurant.cuisine,
      description: newRestaurant.description,
      contact: newRestaurant.contact,
      image_url: imageUrl,
    };

    if (editingId) {
      const { error } = await supabase.from("restaurants").update(restaurantData).eq("id", editingId);
      if (error) console.error(error);
      else alert("Restaurant updated!");
    } else {
      const { error } = await supabase.from("restaurants").insert([restaurantData]);
      if (error) console.error(error);
      else alert("Restaurant added!");
    }

    setNewRestaurant({ name: "", location: "", cuisine: "", description: "", contact: "", imageFile: null, image_url: "" });
    setEditingId(null);
    setShowForm(false); // hide form after add/update
    fetchRestaurants();
  };

  const handleEdit = (restaurant) => {
    setEditingId(restaurant.id);
    setNewRestaurant({ ...restaurant, imageFile: null });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this restaurant?")) return;
    const { error } = await supabase.from("restaurants").delete().eq("id", id);
    if (error) console.error(error);
    else fetchRestaurants();
  };

  return (
    <Container>
      <AdminNavbar />
      <PageTitleRow>
        <PageTitle>Admin Panel: Manage Restaurants</PageTitle>
        <Button variant="add" onClick={() => { setShowForm(!showForm); setEditingId(null); }}>
          <FaPlus style={{ marginRight: "5px" }} /> Add Restaurant
        </Button>
      </PageTitleRow>

      <LogoutButton />

      {showForm && (
        <Form onSubmit={handleAddOrUpdate}>
          <FormTitle>{editingId ? "Edit Restaurant" : "Add New Restaurant"}</FormTitle>
          <Input name="name" placeholder="Name" value={newRestaurant.name} onChange={handleInputChange} />
          <Input name="location" placeholder="Location" value={newRestaurant.location} onChange={handleInputChange} />
          <Input name="cuisine" placeholder="Cuisine" value={newRestaurant.cuisine} onChange={handleInputChange} />
          <TextArea name="description" placeholder="Description" rows={3} value={newRestaurant.description} onChange={handleInputChange} />
          <Input name="contact" placeholder="Contact" value={newRestaurant.contact} onChange={handleInputChange} />
          <Input type="file" onChange={handleFileChange} />
          {newRestaurant.imageFile && <ImagePreview src={URL.createObjectURL(newRestaurant.imageFile)} alt="Preview" />}
          {!newRestaurant.imageFile && newRestaurant.image_url && <ImagePreview src={newRestaurant.image_url} alt="Preview" />}
          <Button type="submit">{editingId ? "Update Restaurant" : "Add Restaurant"}</Button>
        </Form>
      )}

      <h3>Existing Restaurants</h3>
      {loading && <p>Loading...</p>}
      {!loading && restaurants.length === 0 && <p>No restaurants yet.</p>}

      {restaurants.map((r) => (
        <RestaurantCard key={r.id}>
          {r.image_url && <CardImage src={r.image_url} alt={r.name} />}
          <CardHeader>
            <Title>{r.name}</Title>
            <CuisineBadge>{r.cuisine}</CuisineBadge>
          </CardHeader>
          <CardBody>
            <Description>{r.description}</Description>
            <InfoText><strong>Location:</strong> {r.location}</InfoText>
            <InfoText><strong>Contact:</strong> {r.contact}</InfoText>
            <RatingText>
              <strong>Average Rating:</strong> {r.avgRating} {r.reviewCount > 0 && `(${r.reviewCount} reviews)`}
            </RatingText>

            <div>
              <Link to={`/admin/restaurants/${r.id}/menu`}>
                <Button><FaPencilAlt style={{ marginRight: "5px" }} /> Edit Menu</Button>
              </Link>
              <Button variant="edit" onClick={() => handleEdit(r)}><FaPencilAlt style={{ marginRight: "5px" }} /> Edit Restaurant Details</Button>
              <Button variant="delete" onClick={() => handleDelete(r.id)}><FaTrash style={{ marginRight: "5px" }} /> Delete</Button>
            </div>
          </CardBody>
        </RestaurantCard>
      ))}
    </Container>
  );
}
