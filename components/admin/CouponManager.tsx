"use client";

import { useState } from "react";
import { formatBRL } from "@/lib/format";
import {
  createCoupon,
  toggleCouponActive,
  deleteCoupon,
} from "@/app/actions/coupons";

interface CouponDto {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  maxUses: number | null;
  uses: number;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function CouponManager({
  initialCoupons,
}: {
  initialCoupons: CouponDto[];
}) {
  const [coupons, setCoupons] = useState<CouponDto[]>(initialCoupons);

  // Form states
  const [code, setCode] = useState("");
  const [type, setType] = useState<"PERCENTAGE" | "FIXED">("FIXED");
  const [value, setValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);

    const valueNum = parseFloat(value);
    if (isNaN(valueNum) || valueNum <= 0) {
      setFormError("Por favor, insira um valor válido maior que zero.");
      setFormLoading(false);
      return;
    }

    const payload = {
      code,
      type,
      value: valueNum,
      maxUses: maxUses ? parseInt(maxUses) : null,
      expiresAt: expiresAt || null,
    };

    const res = await createCoupon(payload);
    setFormLoading(false);

    if (res.ok) {
      setFormSuccess("Cupom cadastrado com sucesso!");
      // Reset form fields
      setCode("");
      setValue("");
      setMaxUses("");
      setExpiresAt("");

      // Temporarily append to client state for instant preview
      const newCoupon: CouponDto = {
        id: `temp_${Date.now()}`,
        code: code.trim().toUpperCase(),
        type,
        value: valueNum,
        maxUses: maxUses ? parseInt(maxUses) : null,
        uses: 0,
        active: true,
        expiresAt: expiresAt || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCoupons((prev) => [newCoupon, ...prev]);
    } else {
      setFormError(res.error);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    if (id.startsWith("temp_")) return; // skip for temp client-side coupons
    setActionLoadingId(id);
    const res = await toggleCouponActive(id, !currentActive);
    setActionLoadingId(null);

    if (res.ok) {
      setCoupons((prev) =>
        prev.map((c) => (c.id === id ? { ...c, active: !currentActive } : c))
      );
    } else {
      alert(res.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (id.startsWith("temp_")) {
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      return;
    }

    if (!confirm("Tem certeza que deseja excluir este cupom?")) return;

    setActionLoadingId(id);
    const res = await deleteCoupon(id);
    setActionLoadingId(null);

    if (res.ok) {
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } else {
      alert(res.error);
    }
  };

  function formatDate(isoString: string | null): string {
    if (!isoString) return "Nunca";
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
    }).format(new Date(isoString));
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-fox">Painel</p>
        <h1 className="mt-2 font-serif text-4xl text-primary">Cupons de Desconto</h1>
        <p className="mt-2 max-w-2xl text-dark/60">
          Cadastre cupons para campanhas de desconto ou influenciadores. Cupons ativos e dentro da validade serão aplicados no checkout.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
        {/* List Table Card */}
        <div className="overflow-x-auto rounded-3xl border border-gold/25 bg-cream-light shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold/25 text-left text-primary">
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium">Tipo/Valor</th>
                <th className="px-4 py-3 font-medium">Uso / Limite</th>
                <th className="px-4 py-3 font-medium">Expiração</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => {
                const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
                const limitReached = coupon.maxUses !== null && coupon.uses >= coupon.maxUses;
                const statusLabel = !coupon.active
                  ? "Inativo"
                  : isExpired
                  ? "Expirado"
                  : limitReached
                  ? "Limite Atingido"
                  : "Ativo";

                const badgeClass = !coupon.active
                  ? "border-red-200 bg-red-50 text-red-700"
                  : isExpired
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : limitReached
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-forest/30 bg-forest/10 text-forest";

                return (
                  <tr
                    key={coupon.id}
                    className="border-b border-gold/15 last:border-0 hover:bg-cream/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-bold text-primary tracking-wider">
                      {coupon.code}
                    </td>
                    <td className="px-4 py-3 text-dark">
                      {coupon.type === "PERCENTAGE" ? (
                        <span>{coupon.value}% de desc.</span>
                      ) : (
                        <span className="font-medium text-primary">
                          {formatBRL(coupon.value)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-dark/75">
                      {coupon.uses} / {coupon.maxUses ?? "∞"}
                    </td>
                    <td className="px-4 py-3 text-dark/70">
                      {formatDate(coupon.expiresAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs ${badgeClass}`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-3 items-center">
                        <button
                          onClick={() => handleToggleActive(coupon.id, coupon.active)}
                          disabled={actionLoadingId === coupon.id}
                          className="text-xs text-primary underline underline-offset-2 hover:text-primary-light disabled:opacity-50"
                        >
                          {coupon.active ? "Desativar" : "Ativar"}
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          disabled={actionLoadingId === coupon.id}
                          className="text-xs text-red-600 underline underline-offset-2 hover:text-red-800 disabled:opacity-50"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {coupons.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-dark/55">Nenhum cupom cadastrado.</p>
            </div>
          )}
        </div>

        {/* Creation Form Card */}
        <div className="rounded-3xl border border-gold/25 bg-cream-light p-6 shadow-sm">
          <h2 className="font-serif text-2xl text-primary mb-5">Novo Cupom</h2>
          <form onSubmit={handleCreateCoupon} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-dark/65 mb-1.5">
                Código do Cupom
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="EX: DESCONTO10"
                className="input-field uppercase font-mono tracking-widest"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-dark/65 mb-1.5">
                  Tipo
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as "PERCENTAGE" | "FIXED")}
                  className="input-field text-sm"
                >
                  <option value="FIXED">Valor Fixo (R$)</option>
                  <option value="PERCENTAGE">Porcentagem (%)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-dark/65 mb-1.5">
                  Valor
                </label>
                <input
                  type="number"
                  required
                  step="any"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={type === "PERCENTAGE" ? "10" : "15.00"}
                  className="input-field text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-dark/65 mb-1.5">
                  Uso Máximo (opcional)
                </label>
                <input
                  type="number"
                  min="1"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  placeholder="Ilimitado"
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-dark/65 mb-1.5">
                  Expiração (opcional)
                </label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="input-field text-sm"
                />
              </div>
            </div>

            {formError && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700" role="alert">
                {formError}
              </p>
            )}

            {formSuccess && (
              <p className="rounded-xl border border-forest/30 bg-forest/10 px-4 py-3 text-xs text-forest" role="alert">
                {formSuccess}
              </p>
            )}

            <button
              type="submit"
              disabled={formLoading}
              className="btn-primary w-full justify-center py-3 text-xs font-bold disabled:opacity-50"
            >
              {formLoading ? "Cadastrando..." : "Cadastrar Cupom"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
