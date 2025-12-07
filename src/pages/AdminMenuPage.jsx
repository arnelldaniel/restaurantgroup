import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import styled from 'styled-components';
import { UserContext } from './UserContext';
import { FaPencilAlt, FaTrash, FaArrowLeft } from 'react-icons/fa';

// ---- Full-page container ----
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

// Headings
const PageTitle = styled.h2`
  font-size: 36px;
  margin-bottom: 20px;
  color: #343a40;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const BackButton = styled.button`
  padding: 8px 12px;
  margin-bottom: 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: white;
  background-color: #6c757d;
  display: flex;
  align-items: center;

  &:hover {
    opacity: 0.85;
    transform: translateY(-1px);
  }

  svg {
    margin-right: 5px;
  }
`;

const Form = styled.form`
  margin-bottom: 40px;
  background: #ffffff;
  padding: 25px 20px;
  border-radius: 12px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FormTitle = styled.h3`
  margin-bottom: 20px;
  font-size: 22px;
  color: #333;
  border-bottom: 2px solid #007bff;
  padding-bottom: 5px;
`;

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

const TextArea = styled.textarea`
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
  resize: vertical;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
  }
`;

const Button = styled.button`
  padding: 10px 16px;
  margin: 5px 5px 0 0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: white;
  font-weight: 500;
  background-color: ${(props) =>
    props.variant === 'delete' ? '#dc3545' :
    props.variant === 'edit' ? '#ffc107' : '#007bff'};

  &:hover {
    opacity: 0.85;
  }

  svg {
    margin-right: 5px;
  }
`;

// Table
const Table = styled.table`
  width: 100%;
  margin-top: 20px;
  border-collapse: collapse;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
`;

const Th = styled.th`
  padding: 12px;
  border-bottom: 2px solid #007bff;
  text-align: left;
  background-color: #f7f9fb;
`;

const Td = styled.td`
  padding: 10px;
  border-bottom: 1px solid #e0e0e0;
`;

export default function AdminMenuPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ name: '', price: '', description: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchMenuItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', id);
    if (error) console.error('Error fetching menu items:', error);
    else setMenuItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMenuItems();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) return alert('Name and price are required.');

    const itemData = {
      name: newItem.name,
      price: parseFloat(newItem.price),
      description: newItem.description,
      restaurant_id: id
    };

    if (editingId) {
      const { error } = await supabase
        .from('menu_items')
        .update(itemData)
        .eq('id', editingId);
      if (error) console.error('Update error:', error);
      else alert('Menu item updated!');
    } else {
      const { error } = await supabase
        .from('menu_items')
        .insert([itemData]);
      if (error) console.error('Insert error:', error);
      else alert('Menu item added!');
    }

    setNewItem({ name: '', price: '', description: '' });
    setEditingId(null);
    fetchMenuItems();
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setNewItem({
      name: item.name,
      price: item.price,
      description: item.description
    });
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    const { error } = await supabase.from('menu_items').delete().eq('id', itemId);
    if (error) console.error('Delete error:', error);
    else fetchMenuItems();
  };

  return (
    <Container>
      <BackButton onClick={() => navigate(-1)}>
        <FaArrowLeft /> Go Back
      </BackButton>

      <PageTitle>Manage Menu Items</PageTitle>

      <Form onSubmit={handleAddOrUpdate}>
        <FormTitle>{editingId ? 'Edit Menu Item' : 'Add New Menu Item'}</FormTitle>
        <Input
          name="name"
          placeholder="Item Name"
          value={newItem.name}
          onChange={handleInputChange}
        />
        <Input
          name="price"
          type="number"
          step="0.01"
          placeholder="Price"
          value={newItem.price}
          onChange={handleInputChange}
        />
        <TextArea
          name="description"
          placeholder="Description"
          rows={3}
          value={newItem.description}
          onChange={handleInputChange}
        />
        <Button type="submit">{editingId ? 'Update Item' : 'Add Item'}</Button>
      </Form>

      {loading && <p>Loading menu items...</p>}
      {!loading && menuItems.length === 0 && <p>No menu items found.</p>}

      <Table>
        <thead>
          <tr>
            <Th>Item</Th>
            <Th>Price</Th>
            <Th>Description</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {menuItems.map(item => (
            <tr key={item.id}>
              <Td>{item.name}</Td>
              <Td>£{item.price.toFixed(2)}</Td>
              <Td>{item.description}</Td>
              <Td>
                <Button variant="edit" onClick={() => handleEdit(item)}>
                  <FaPencilAlt /> Edit
                </Button>
                <Button variant="delete" onClick={() => handleDelete(item.id)}>
                  <FaTrash /> Delete
                </Button>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}
