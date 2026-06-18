import { Routes, Route } from 'react-router-dom'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { Home } from './pages/Home'
import { Collections } from './pages/Collections'
import { ProductDetail } from './pages/ProductDetail'
import { Cart } from './pages/Cart'
import { Checkout } from './pages/Checkout'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Profile } from './pages/Profile'
import { Orders } from './pages/Orders'
import { Wishlist } from './pages/Wishlist'
import { Admin } from './pages/Admin'

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans antialiased text-foreground">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
