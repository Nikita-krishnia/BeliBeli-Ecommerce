import { Routes, Route,useLocation} from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import Footer from './components/Footer';
import MainLayout from './layouts/MainLayout';
import ProductDetail from './components/ProductDetail';
import CartPage from './components/CartPage';
import OrderSuccess from './components/OrderSuccess';
import OrdersPage from './components/OrderPage';
import TrackOrder from './components/TrackOrder';
import ScrollToTop from './components/ScrollToTop';
import { useState } from 'react';
import WishlistPage from './components/WishlistPage';
import AIAssistant from './components/AIAssistant';


function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const currentToken = localStorage.getItem('token') || 'guest';
  const location = useLocation();
  const hideHeaderFooter = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <>
      {!hideHeaderFooter && <Header />}
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/track/:orderId" element={<TrackOrder />} />
      </Routes>
      <AIAssistant key={currentToken} />
     {!hideHeaderFooter && <Footer />}
    </>
  );
}


export default App;
