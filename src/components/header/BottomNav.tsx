import { useState, useMemo, useEffect } from 'react';

import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom';

import { Home, LayoutGrid, Search, Heart, User, X } from 'lucide-react';

import { AnimatePresence, motion } from 'framer-motion';

import { useProducts, useCategories, productImage, withImageParams, formatINR } from '@/lib/queries';

import { useAuth } from '@/hooks/useAuth';

import { useWishlist } from '@/hooks/useWishlist';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';



const BottomNav = () => {

  const { pathname } = useLocation();

  const navigate = useNavigate();

  const { user, profile } = useAuth();

  const { data: wishlistItems = [] } = useWishlist();

  const { data: products = [] } = useProducts();

  const { data: categories = [] } = useCategories();

  const [searchOpen, setSearchOpen] = useState(false);

  const [q, setQ] = useState('');



  const wishlistCount = wishlistItems.length;



  const results = useMemo(() => {

    const term = q.trim().toLowerCase();

    if (!term) return [];

    return products.filter((p) => {

      const tagsStr = (p.tags || []).join(' ').toLowerCase();

      return (

        p.name.toLowerCase().includes(term) ||

        (p.description ?? '').toLowerCase().includes(term) ||

        (p.categories?.name ?? '').toLowerCase().includes(term) ||

        tagsStr.includes(term)

      );

    }).slice(0, 30);

  }, [q, products]);



  useEffect(() => {

    if (!searchOpen) { setQ(''); return; }

    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSearchOpen(false); };

    window.addEventListener('keydown', onKey);

    return () => window.removeEventListener('keydown', onKey);

  }, [searchOpen]);



  useEffect(() => {

    const handler = () => setSearchOpen(true);

    window.addEventListener('eraya:open-search', handler);

    return () => window.removeEventListener('eraya:open-search', handler);

  }, []);



  // Close search when navigating

  useEffect(() => { setSearchOpen(false); }, [pathname]);



  if (pathname.startsWith('/admin')) return null;

  if (pathname.startsWith('/auth/')) return null;

  if (pathname.startsWith('/reset-password')) return null;



  const base = 'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium tracking-wide transition-colors relative';

  const active = 'text-charcoal';

  const inactive = 'text-muted-foreground';



  return (

    <>

      <nav

        aria-label="Bottom navigation"

        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-[#EDE8E1]"

        style={{ paddingBottom: 'env(safe-area-inset-bottom)', boxShadow: '0 -1px 12px rgba(0,0,0,0.06)' }}

      >

        <div className="flex items-stretch h-[60px]">



          {/* 1 — Home */}

          <NavLink to="/" end className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>

            {({ isActive }) => (

              <>

                {isActive && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-[#C9A84C]" />}

                <Home className="h-[22px] w-[22px]" />

                <span>Home</span>

              </>

            )}

          </NavLink>



          {/* 2 — Shop / Catalogue */}

          <NavLink to="/catalogue" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>

            {({ isActive }) => (

              <>

                {isActive && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-[#C9A84C]" />}

                <LayoutGrid className="h-[22px] w-[22px]" />

                <span>Shop</span>

              </>

            )}

          </NavLink>



          {/* 3 — Search (elevated center button) */}

          <button

            onClick={() => setSearchOpen(true)}

            className={`${base} ${searchOpen ? active : inactive}`}

            aria-label="Search"

          >

            <div className="w-10 h-10 rounded-full bg-[#C9A84C] flex items-center justify-center shadow-md -mt-4">

              <Search className="h-5 w-5 text-white" />

            </div>

            <span className="mt-0.5">Search</span>

          </button>



          {/* 4 — Saved / Wishlist */}

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



          {/* 5 — Account / Profile */}

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



      {/* Search full-screen overlay — keep exactly as before */}

      <AnimatePresence>

        {searchOpen && (

          <motion.div

            initial={{ y: '100%' }}

            animate={{ y: 0 }}

            exit={{ y: '100%' }}

            transition={{ duration: 0.25, ease: 'easeOut' }}

            className="fixed inset-0 z-[60] bg-white flex flex-col"

            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}

          >

            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#EDE8E1]">

              <Search className="h-5 w-5 text-muted-foreground shrink-0" />

              <input

                autoFocus

                value={q}

                onChange={(e) => setQ(e.target.value)}

                placeholder="Search jewellery…"

                className="flex-1 outline-none bg-transparent text-[18px] placeholder:text-muted-foreground"

                style={{ fontSize: '16px' }}

              />

              <button onClick={() => setSearchOpen(false)} aria-label="Close search" className="p-2 -mr-2">

                <X className="h-5 w-5" />

              </button>

            </div>

            <div className="flex-1 overflow-y-auto">
              {q.trim() && results.length === 0 && (

                <div className="px-6 py-12 text-center">

                  <p className="text-sm text-muted-foreground mb-3">No results for "{q}"</p>

                  <Link to="/catalogue" onClick={() => setSearchOpen(false)} className="text-sm text-[#C9A84C] underline">Browse catalogue</Link>

                </div>

              )}

              {results.map((p) => (

                <button

                  key={p.id}

                  onClick={() => { setSearchOpen(false); navigate(`/jewellery/${p.slug ?? p.id}`); }}

                  className="w-full flex items-center gap-3 px-4 py-3 border-b border-[#EDE8E1] text-left active:bg-muted/40"

                >

                  <img src={withImageParams(productImage(p), 96, 70)} alt={p.name} className="h-12 w-12 rounded-md object-cover bg-muted" />

                  <div className="min-w-0 flex-1">

                    <p className="text-sm font-medium truncate">{p.name}</p>

                    <p className="text-xs text-muted-foreground">{p.categories?.name || ''}</p>

                  </div>

                  <span className="text-sm font-semibold text-[#C9A84C] shrink-0">{formatINR(p.discounted_price ?? p.original_price)}</span>

                </button>

              ))}

              {!q.trim() && (

                <div className="px-6 py-8">

                  <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-muted-foreground mb-3">Popular categories</p>

                  <div className="flex flex-wrap gap-2">

                    {categories.filter((c) => c.is_visible).slice(0, 8).map((c) => (

                      <Link key={c.id} to={`/collection/${c.slug}`} onClick={() => setSearchOpen(false)} className="px-3 py-1.5 rounded-full border border-[#EDE8E1] text-xs hover:bg-muted/40">{c.name}</Link>

                    ))}

                  </div>

                </div>

              )}

            </div>

          </motion.div>

        )}

      </AnimatePresence>

    </>

  );

};



export default BottomNav;
