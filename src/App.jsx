import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { UserContext } from './pages/UserContext';


import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import SearchRestaurantsPage from './pages/SearchRestaurantsPage';
import RestaurantDetailsPage from './pages/RestaurantDetailsPage';
import ViewMenuPage from './pages/ViewMenuPage';
import SubmitReviewPage from './pages/SubmitReviewPage';
import ViewReviewsPage from './pages/ViewReviewsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminRestaurantsPage from './pages/AdminRestaurantsPage';
import AdminMenuPage from './pages/AdminMenuPage';
import AdminUsersPage from './pages/AdminUsersPage';
import ModerationPage from './pages/ModerationPage';

// Moderator pages
import ModeratorLoginPage from './pages/ModeratorLoginPage';




function App() {
  // GLOBAL USER STATE (shared everywhere)
  const [user, setUser] = useState(null); 
  // Example shape: { id: 1, username: "bob" }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Router>
        <Routes>
          
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/search" element={<SearchRestaurantsPage />} />
          <Route path="/restaurant/:id" element={<RestaurantDetailsPage />} />
          <Route path="/restaurant/:id/menu" element={<ViewMenuPage />} />
          <Route path="/restaurant/:id/review" element={<SubmitReviewPage />} />
          <Route path="/restaurant/:id/reviews" element={<ViewReviewsPage />} />

          <Route path="/moderator/login" element={<ModeratorLoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/restaurants" element={<AdminRestaurantsPage />} />
          <Route path="/admin/restaurants/:id/menu" element={<AdminMenuPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/moderation" element={<ModerationPage />} />
        </Routes>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
