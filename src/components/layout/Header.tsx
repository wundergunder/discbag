import { useAuth } from '../auth/AuthProvider';
import { Link } from 'react-router-dom';
import { 
  Disc, 
  Menu, 
  X, 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  MessageCircle, 
  User,
  LogOut,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    await signOut();
  };

  return (
    <header className="bg-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Disc size={32} />
              <span className="text-xl font-bold">MyDiscBag.club</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="p-2 hover:bg-blue-700 rounded-full group relative"
                  title="Dashboard"
                >
                  <LayoutDashboard size={24} />
                  <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Dashboard
                  </span>
                </Link>
                <Link 
                  to="/inventory" 
                  className="p-2 hover:bg-blue-700 rounded-full group relative"
                  title="My Discs"
                >
                  <Package size={24} />
                  <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    My Discs
                  </span>
                </Link>
                <Link 
                  to="/marketplace" 
                  className="p-2 hover:bg-blue-700 rounded-full group relative"
                  title="Marketplace"
                >
                  <ShoppingBag size={24} />
                  <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Marketplace
                  </span>
                </Link>
                <Link 
                  to="/messages" 
                  className="p-2 hover:bg-blue-700 rounded-full group relative"
                  title="Messages"
                >
                  <MessageCircle size={24} />
                  <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Messages
                  </span>
                </Link>
                <Link 
                  to="/profile" 
                  className="p-2 hover:bg-blue-700 rounded-full group relative"
                  title="Profile"
                >
                  <User size={24} />
                  <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Profile
                  </span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="p-2 hover:bg-blue-700 rounded-full group relative"
                  title="Sign Out"
                >
                  <LogOut size={24} />
                  <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Sign Out
                  </span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="p-2 hover:bg-blue-700 rounded-full group relative"
                  title="Sign In"
                >
                  <LogIn size={24} />
                  <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Sign In
                  </span>
                </Link>
                <Link 
                  to="/signup" 
                  className="p-2 hover:bg-blue-700 rounded-full group relative"
                  title="Sign Up"
                >
                  <UserPlus size={24} />
                  <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Sign Up
                  </span>
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-blue-200"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 hover:bg-blue-700 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LayoutDashboard size={20} />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/inventory"
                  className="flex items-center gap-2 px-3 py-2 hover:bg-blue-700 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Package size={20} />
                  <span>My Discs</span>
                </Link>
                <Link
                  to="/marketplace"
                  className="flex items-center gap-2 px-3 py-2 hover:bg-blue-700 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShoppingBag size={20} />
                  <span>Marketplace</span>
                </Link>
                <Link
                  to="/messages"
                  className="flex items-center gap-2 px-3 py-2 hover:bg-blue-700 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <MessageCircle size={20} />
                  <span>Messages</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2 hover:bg-blue-700 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User size={20} />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={(e) => {
                    handleSignOut(e);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-blue-700 rounded-md"
                >
                  <LogOut size={20} />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-3 py-2 hover:bg-blue-700 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LogIn size={20} />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center gap-2 px-3 py-2 hover:bg-blue-700 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <UserPlus size={20} />
                  <span>Sign Up</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}