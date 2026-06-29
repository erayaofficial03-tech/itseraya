import { useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, LayoutGrid, Search, Heart, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useWishlist } from '@/hooks/useWishlist';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const BottomNav = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { data: wishlistItems = [] } = useWishlist();

  const wishlistCount = wishlistItems.length;

  // Listen for legacy direct dispatch — no-op (SearchOverlay handles it globally)
  useEffect(() => {}, []);

  if (pathname.startsWith('/admin')) return null;
  if (pathname.startsWith('/auth/')) return null;
  if (pathname.startsWith('/reset-password')) return null;

  const base = 'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium tracking-wide transition-colors relative';
  const active = 'text-charcoal';
  const inactive = 'text-muted-foreground';

  const openSearch = () => window.dispatchEvent(new CustomEvent('eraya:open-search'));

  return (
    <nav
      aria-label="Bottom navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-[#EDE8E1]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)', boxShadow: '0 -1px 12px rgba(0,0,0,0.06)' }}
    >
      <div className="flex items-stretch h-[60px]">
        <NavLink to="/" end className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
          {({ isActive }) => (
            <>
              {isActive && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-[#C9A84C]" />}
              <Home className="h-[22px] w-[22px]" />
              <span>Home</span>
            </>
          )}
        </NavLink>

        <NavLink to="/catalogue" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
          {({ isActive }) => (
            <>
              {isActive && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-[#C9A84C]" />}
              <LayoutGrid className="h-[22px] w-[22px]" />
              <span>Shop</span>
            </>
          )}
        </NavLink>

        <button onClick={openSearch} className={`${base} ${inactive}`} aria-label="Search">
          <div className="w-10 h-10 rounded-full bg-[#C9A84C] flex items-center justify-center shadow-md -mt-4">
            <Search className="h-5 w-5 text-white" />
          </div>
          <span className="mt-0.5">Search</span>
        </button>

        <NavLink to="/wishlist" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
          {({ isActive }) => (
            <>
              {isActive && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-[#C9A84C]" />}
              <div className="relative">
                <Heart className="h-[22px] w-[22px]" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-0.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </div>
              <span>Saved</span>
            </>
          )}
        </NavLink>

        <button
          onClick={() => navigate(user ? '/profile' : '/login')}
          className={`${base} ${pathname === '/profile' || pathname === '/login' ? active : inactive}`}
          aria-label={user ? 'My account' : 'Sign in'}
        >
          {pathname === '/profile' && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-[#C9A84C]" />}
          {user ? (
            <Avatar className="h-[22px] w-[22px] border border-ink/30">
              <AvatarImage src={user?.user_metadata?.avatar_url || undefined} />
              <AvatarFallback className="text-[8px] bg-ink text-ivory">
                {(profile?.full_name || user.email || 'U').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <User className="h-[22px] w-[22px]" />
          )}
          <span>{user ? 'Account' : 'Sign In'}</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
