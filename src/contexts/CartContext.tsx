import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CartProduct {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string;
  vendor_id: string;
  vendor_name: string;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isLoading: boolean;
  addItem: (product: CartProduct, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (productId: string) => boolean;
  getQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_KEY = "giftora_guest_cart";

/* ---------- localStorage helpers (guest cart) ---------- */
function readGuestCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeGuestCart(items: CartItem[]) {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch {
    /* ignore quota errors */
  }
}

/* ---------- Supabase helpers (logged-in cart) ---------- */
async function fetchDbCart(userId: string): Promise<CartItem[]> {
  const { data, error } = await supabase
    .from("cart_items")
    .select(
      `id, quantity, product_id,
       products (
         id, name, price, image_url, category, vendor_id,
         vendor_profiles ( business_name )
       )`
    )
    .eq("user_id", userId);

  if (error) {
    console.error("[Cart] fetch error:", error);
    return [];
  }

  return (data ?? [])
    .map((row: any) => {
      const p = row.products;
      if (!p) return null;
      return {
        quantity: row.quantity,
        product: {
          id: p.id,
          name: p.name,
          price: Number(p.price),
          image_url: p.image_url ?? null,
          category: p.category,
          vendor_id: p.vendor_id,
          vendor_name: p.vendor_profiles?.business_name ?? "Vendor",
        },
      } as CartItem;
    })
    .filter(Boolean) as CartItem[];
}

/* ---------- Provider ---------- */
export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /* Load cart on mount and when user changes */
  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        if (user) {
          // Logged in → Supabase is source of truth
          const dbItems = await fetchDbCart(user.id);
          if (cancelled) return;

          // Merge any guest cart into Supabase, then clear local
          const guestItems = readGuestCart();
          if (guestItems.length > 0) {
            await mergeGuestIntoDb(user.id, guestItems);
            localStorage.removeItem(GUEST_CART_KEY);
            const merged = await fetchDbCart(user.id);
            if (!cancelled) setItems(merged);
          } else {
            setItems(dbItems);
          }
        } else {
          // Guest → localStorage
          if (!cancelled) setItems(readGuestCart());
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  /* -------- Mutations -------- */
  const addItem = useCallback(
    async (product: CartProduct, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.product.id === product.id);
        let next: CartItem[];
        if (existing) {
          next = prev.map((i) =>
            i.product.id === product.id
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        } else {
          next = [...prev, { product, quantity }];
        }

        if (user) {
          // Fire-and-forget DB sync
          upsertDbCartItem(user.id, product.id, quantity);
        } else {
          writeGuestCart(next);
        }
        return next;
      });
    },
    [user]
  );

  const removeItem = useCallback(
    async (productId: string) => {
      setItems((prev) => {
        const next = prev.filter((i) => i.product.id !== productId);
        if (user) {
          deleteDbCartItem(user.id, productId);
        } else {
          writeGuestCart(next);
        }
        return next;
      });
    },
    [user]
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (quantity <= 0) {
        await removeItem(productId);
        return;
      }
      setItems((prev) => {
        const next = prev.map((i) =>
          i.product.id === productId ? { ...i, quantity } : i
        );
        if (user) {
          setDbCartQuantity(user.id, productId, quantity);
        } else {
          writeGuestCart(next);
        }
        return next;
      });
    },
    [user, removeItem]
  );

  const clearCart = useCallback(async () => {
    setItems([]);
    if (user) {
      await supabase.from("cart_items").delete().eq("user_id", user.id);
    } else {
      localStorage.removeItem(GUEST_CART_KEY);
    }
  }, [user]);

  const isInCart = useCallback(
    (productId: string) => items.some((i) => i.product.id === productId),
    [items]
  );

  const getQuantity = useCallback(
    (productId: string) =>
      items.find((i) => i.product.id === productId)?.quantity ?? 0,
    [items]
  );

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        isLoading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isInCart,
        getQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (ctx === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}

/* =====================================================
   Supabase sync functions (best-effort, don't throw)
   ===================================================== */

async function upsertDbCartItem(
  userId: string,
  productId: string,
  delta: number
) {
  // Try update first
  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + delta })
      .eq("id", existing.id);
  } else {
    await supabase
      .from("cart_items")
      .insert({ user_id: userId, product_id: productId, quantity: delta });
  }
}

async function deleteDbCartItem(userId: string, productId: string) {
  await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);
}

async function setDbCartQuantity(
  userId: string,
  productId: string,
  quantity: number
) {
  await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("user_id", userId)
    .eq("product_id", productId);
}

async function mergeGuestIntoDb(userId: string, guestItems: CartItem[]) {
  for (const item of guestItems) {
    await upsertDbCartItem(userId, item.product.id, item.quantity);
  }
}