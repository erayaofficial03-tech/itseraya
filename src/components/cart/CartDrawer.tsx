import { useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useCartContext } from '@/components/providers/CartProvider';
import { useSettings } from '@/lib/queries';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

type Props = { open: boolean; onClose: () => void };

const formatPrice = (n: number) =>
  `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export const CartDrawer = ({ open, onClose }: Props) => {
  const { cartItems, subtotal, updateQty, removeFromCart } = useCartContext();
  const { data: settings } = useSettings();
  const { user } = useAuth();
  const navigate = useNavigate();

  const freeShippingAbove = settings?.shipping_free_above ?? 999;
  const shippingCharge =
    subtotal >= freeShippingAbove ? 0 : settings?.shipping_charge ?? 99;
  const total = subtotal + shippingCharge;
  const remaining = Math.max(0, freeShippingAbove - subtotal);
  const progress = Math.min(100, (subtotal / freeShippingAbove) * 100);

  const goTo = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <SheetHeader className="flex-row items-center justify-between space-y-0 border-b px-5 py-4">
          <SheetTitle className="flex items-center gap-2 text-base font-medium">
            <ShoppingBag className="h-4 w-4" />
            Your Cart
            <span className="text-muted-foreground">({cartItems.length})</span>
          </SheetTitle>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="rounded-full bg-muted p-5">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-base font-medium">Your cart is empty</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Discover pieces you'll love.
              </p>
            </div>
            <Button onClick={() => goTo('/catalogue')} className="mt-2">
              Browse Collection
            </Button>
          </div>
        ) : (
          <>
            {/* Free shipping progress */}
            <div className="border-b bg-muted/30 px-5 py-3">
              {shippingCharge === 0 ? (
                <p className="text-sm font-medium text-primary">
                  🎉 You've unlocked free shipping!
                </p>
              ) : (
                <p className="text-sm">
                  Add{' '}
                  <span className="font-semibold">{formatPrice(remaining)}</span>{' '}
                  more for free shipping
                </p>
              )}
              <Progress value={progress} className="mt-2 h-1.5" />
            </div>

            {/* Guest banner */}
            {!user && (
              <button
                onClick={() => goTo('/login')}
                className="border-b bg-accent/30 px-5 py-2.5 text-left text-xs text-muted-foreground transition hover:bg-accent/50"
              >
                <span className="font-medium text-foreground">Sign in</span> to
                save your cart across devices →
              </button>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="space-y-4">
                {cartItems.map((item) => (
                  <li key={item.id} className="flex gap-3">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                      {item.product_image_url && (
                        <img
                          src={item.product_image_url}
                          alt={item.product_name}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between gap-2">
                        <p className="line-clamp-2 text-sm font-medium">
                          {item.product_name}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          aria-label="Remove item"
                          className="text-muted-foreground transition hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      {(item.variant_size || item.variant_colour) && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {[item.variant_size, item.variant_colour]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      )}
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center rounded-md border">
                          <button
                            onClick={() => updateQty(item.id, item.quantity - 1)}
                            className="p-1.5 transition hover:bg-muted"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="min-w-[2rem] text-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQty(item.id, item.quantity + 1)}
                            className="p-1.5 transition hover:bg-muted"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-sm font-semibold">
                          {formatPrice(item.unit_price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer */}
            <div className="border-t bg-background px-5 py-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className={cn(shippingCharge === 0 && 'text-primary')}>
                    {shippingCharge === 0 ? 'FREE' : formatPrice(shippingCharge)}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              <Button
                size="lg"
                className="mt-4 w-full"
                onClick={() => goTo('/checkout')}
              >
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
