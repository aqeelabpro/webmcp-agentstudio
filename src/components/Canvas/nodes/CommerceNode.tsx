import React from 'react';
import { CommerceNodeData, CommerceProduct } from '../../../types/canvas';
import { ShoppingBag, Plus, Trash2, Tag, Star, Sparkles } from 'lucide-react';

interface Props {
  data: CommerceNodeData;
  onUpdateData: (newData: Partial<CommerceNodeData>) => void;
}

export const CommerceNode: React.FC<Props> = ({ data, onUpdateData }) => {
  const handleAddToCart = (product: CommerceProduct) => {
    const existingIndex = data.cart.findIndex((item) => item.product.id === product.id);
    let newCart = [...data.cart];

    if (existingIndex >= 0) {
      newCart[existingIndex] = {
        ...newCart[existingIndex],
        quantity: newCart[existingIndex].quantity + 1,
      };
    } else {
      newCart.push({ product, quantity: 1 });
    }

    const subtotal = newCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const discountMultiplier = (100 - (data.discountTotal > 0 ? 15 : 0)) / 100;
    const total = subtotal * discountMultiplier;

    onUpdateData({
      cart: newCart,
      subtotal: Math.round(subtotal * 100) / 100,
      total: Math.round(total * 100) / 100,
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    const newCart = data.cart.filter((item) => item.product.id !== productId);
    const subtotal = newCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const discountMultiplier = (100 - (data.discountTotal > 0 ? 15 : 0)) / 100;
    const total = subtotal * discountMultiplier;

    onUpdateData({
      cart: newCart,
      subtotal: Math.round(subtotal * 100) / 100,
      total: Math.round(total * 100) / 100,
    });
  };

  return (
    <div className="flex flex-col h-full text-slate-100 select-text overflow-hidden">
      {/* Promo Banner if applied */}
      {data.appliedPromoCode && (
        <div className="mb-3 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300 animate-pulse">
          <div className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Promo applied: <span className="font-mono font-bold">{data.appliedPromoCode}</span>
          </div>
          <span className="font-bold text-emerald-400">-15% OFF</span>
        </div>
      )}

      {/* Two columns: Catalog and Cart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 overflow-hidden min-h-0">
        {/* Products Column */}
        <div className="flex flex-col min-h-0 border-r border-slate-800/80 pr-2 overflow-y-auto">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
            Catalog Products ({data.products.length})
          </div>
          <div className="space-y-2">
            {data.products.map((prod) => (
              <div
                key={prod.id}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center gap-3 group"
              >
                <img
                  src={prod.image}
                  alt={prod.title}
                  className="w-12 h-12 rounded-lg object-cover bg-slate-800 border border-slate-700/60"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-white truncate">{prod.title}</span>
                    {prod.badge && (
                      <span className="px-1.5 py-0.2 text-[9px] font-bold bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">
                        {prod.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-bold text-emerald-400">${prod.price}</span>
                    {prod.originalPrice && (
                      <span className="text-[10px] text-slate-500 line-through">${prod.originalPrice}</span>
                    )}
                    <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-amber-400" /> {prod.rating}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleAddToCart(prod)}
                  className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500 hover:text-black transition-colors"
                  title="Add to Cart"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Live Cart Column */}
        <div className="flex flex-col min-h-0 pl-1 overflow-y-auto justify-between">
          <div className="min-h-0 overflow-y-auto">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>Agent Live Cart ({data.cart.reduce((acc, i) => acc + i.quantity, 0)})</span>
              <span className="text-[10px] text-emerald-400 font-mono">WebMCP Synced</span>
            </div>

            {data.cart.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-900/50 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                Cart is empty. Add products or prompt AI agent to auto-compose cart.
              </div>
            ) : (
              <div className="space-y-2">
                {data.cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-2 rounded-lg bg-slate-900/70 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-medium text-white truncate">{item.product.title}</p>
                      <p className="text-slate-400 text-[11px]">
                        {item.quantity} × ${item.product.price} = ${(item.quantity * item.product.price).toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveFromCart(item.product.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Summary */}
          <div className="mt-3 pt-2.5 border-t border-slate-800 text-xs space-y-1 bg-slate-950/40 p-2.5 rounded-xl">
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Subtotal:</span>
              <span>${(data.subtotal || 0).toFixed(2)}</span>
            </div>
            {data.appliedPromoCode && (
              <div className="flex justify-between text-emerald-400 text-[11px]">
                <span className="flex items-center gap-1"><Tag className="w-2.5 h-2.5" /> Discount (15%):</span>
                <span>-${((data.subtotal || 0) * 0.15).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-white text-sm pt-1 border-t border-slate-800/80">
              <span>Total:</span>
              <span className="text-emerald-400 font-mono">${(data.total || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
