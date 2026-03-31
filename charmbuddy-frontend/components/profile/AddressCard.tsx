"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import InteractivePress from "@/components/motion/InteractivePress";
import Reveal from "@/components/motion/Reveal";
import { createAddressApi, deleteAddressApi, listAddressesApi, updateAddressApi, type AddressPayload } from "@/lib/api/addresses";
import { ApiError } from "@/lib/api/client";
import type { UserAddress } from "@/lib/api/types";
import { useAuth } from "@/lib/auth-context";

const EMPTY_FORM: AddressPayload = {
  recipient_name: "",
  phone: "",
  address_line: "",
  city: "",
  province: "",
  postal_code: "",
  notes: "",
  is_default: false,
};

export default function AddressCard() {
  const { token } = useAuth();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [form, setForm] = useState<AddressPayload>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasAddresses = addresses.length > 0;

  const sortedAddresses = useMemo(
    () => [...addresses].sort((a, b) => Number(b.is_default) - Number(a.is_default)),
    [addresses],
  );

  const loadAddresses = async () => {
    if (!token) {
      setAddresses([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await listAddressesApi(token);
      setAddresses(response.data);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Gagal memuat daftar alamat.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const validateForm = () => {
    if (!form.recipient_name.trim() || !form.phone.trim() || !form.address_line.trim() || !form.city.trim() || !form.province.trim() || !form.postal_code.trim()) {
      setErrorMessage("Lengkapi semua field wajib alamat.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!token || !validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        ...form,
        notes: form.notes?.trim() || "",
      };

      if (editingId) {
        await updateAddressApi(token, editingId, payload);
      } else {
        await createAddressApi(token, payload);
      }

      await loadAddresses();
      resetForm();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Gagal menyimpan alamat.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (addressId: number) => {
    if (!token) {
      return;
    }

    const isConfirmed = window.confirm("Hapus alamat ini?");
    if (!isConfirmed) {
      return;
    }

    setErrorMessage(null);
    try {
      await deleteAddressApi(token, addressId);
      await loadAddresses();
      if (editingId === addressId) {
        resetForm();
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Gagal menghapus alamat.");
      }
    }
  };

  const handleEdit = (address: UserAddress) => {
    setEditingId(address.id);
    setErrorMessage(null);
    setForm({
      recipient_name: address.recipient_name,
      phone: address.phone,
      address_line: address.address_line,
      city: address.city,
      province: address.province,
      postal_code: address.postal_code,
      notes: address.notes ?? "",
      is_default: address.is_default,
    });
  };

  const handleSetDefault = async (addressId: number) => {
    if (!token) {
      return;
    }

    setErrorMessage(null);
    try {
      await updateAddressApi(token, addressId, { is_default: true });
      await loadAddresses();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Gagal mengubah alamat default.");
      }
    }
  };

  return (
    <Reveal className="w-full">
      <div className="flex w-full items-start justify-between">
        <h2 className="font-[var(--font-satoshi)] text-[clamp(34px,6vw,48px)] font-normal leading-[normal] tracking-[7.2px] text-black">Address</h2>
        <InteractivePress>
          <button
            className="mt-[10px] rounded-[10px] border border-black px-[10px] py-[6px] font-[var(--font-satoshi)] text-[12px] tracking-[1px] text-black"
            onClick={resetForm}
            type="button"
          >
            + NEW
          </button>
        </InteractivePress>
      </div>

      <motion.div className="mt-[15px] w-full rounded-[20px] border border-black bg-white p-[16px] xl:min-h-[236px] xl:max-w-[548px]" whileHover={{ y: -3 }}>
        <div className="space-y-[10px]">
          <p className="font-[var(--font-satoshi)] text-[13px] font-black tracking-[1.2px] text-black/70">{editingId ? "Edit Address" : "Tambah Address"}</p>

          <div className="grid grid-cols-1 gap-[8px]">
            <input className="rounded-[10px] border border-black/20 px-[10px] py-[8px] text-[13px]" onChange={(e) => setForm((prev) => ({ ...prev, recipient_name: e.target.value }))} placeholder="Recipient name*" value={form.recipient_name} />
            <input className="rounded-[10px] border border-black/20 px-[10px] py-[8px] text-[13px]" onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder="Phone*" value={form.phone} />
            <input className="rounded-[10px] border border-black/20 px-[10px] py-[8px] text-[13px]" onChange={(e) => setForm((prev) => ({ ...prev, address_line: e.target.value }))} placeholder="Address line*" value={form.address_line} />
            <div className="grid grid-cols-2 gap-[8px]">
              <input className="rounded-[10px] border border-black/20 px-[10px] py-[8px] text-[13px]" onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} placeholder="City*" value={form.city} />
              <input className="rounded-[10px] border border-black/20 px-[10px] py-[8px] text-[13px]" onChange={(e) => setForm((prev) => ({ ...prev, province: e.target.value }))} placeholder="Province*" value={form.province} />
            </div>
            <input className="rounded-[10px] border border-black/20 px-[10px] py-[8px] text-[13px]" onChange={(e) => setForm((prev) => ({ ...prev, postal_code: e.target.value }))} placeholder="Postal code*" value={form.postal_code} />
            <textarea className="h-[70px] rounded-[10px] border border-black/20 px-[10px] py-[8px] text-[13px]" onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Notes" value={form.notes} />
            <label className="flex items-center gap-[8px] text-[12px] text-black/70">
              <input checked={Boolean(form.is_default)} onChange={(e) => setForm((prev) => ({ ...prev, is_default: e.target.checked }))} type="checkbox" />
              Set as default
            </label>
            <div className="flex gap-[8px]">
              <button className="rounded-[10px] bg-black px-[10px] py-[8px] text-[12px] font-bold text-white disabled:opacity-60" disabled={isSubmitting} onClick={() => void handleSubmit()} type="button">
                {isSubmitting ? "Saving..." : editingId ? "Update" : "Add"}
              </button>
              {editingId ? (
                <button className="rounded-[10px] border border-black/20 px-[10px] py-[8px] text-[12px]" onClick={resetForm} type="button">
                  Cancel
                </button>
              ) : null}
            </div>
          </div>

          {errorMessage ? <p className="text-[12px] text-red-600">{errorMessage}</p> : null}

          <div className="mt-[10px] max-h-[260px] space-y-[8px] overflow-y-auto pr-[4px]">
            {isLoading ? <p className="text-[13px] text-black/60">Loading addresses...</p> : null}
            {!isLoading && !hasAddresses ? <p className="text-[13px] text-black/60">Belum ada alamat tersimpan.</p> : null}
            {!isLoading
              ? sortedAddresses.map((address) => (
                  <div className="rounded-[12px] bg-[rgba(149,178,254,0.35)] p-[10px]" key={address.id}>
                    <p className="text-[13px] font-bold text-black">{address.recipient_name} {address.is_default ? "(Default)" : ""}</p>
                    <p className="text-[12px] text-black/70">{address.phone}</p>
                    <p className="mt-[2px] text-[12px] text-black/80">{address.address_line}, {address.city}, {address.province} {address.postal_code}</p>
                    {address.notes ? <p className="mt-[2px] text-[12px] text-black/65">{address.notes}</p> : null}
                    <div className="mt-[6px] flex gap-[8px]">
                      <button className="text-[11px] font-bold text-[#2d44cf]" onClick={() => handleEdit(address)} type="button">Edit</button>
                      <button className="text-[11px] font-bold text-red-600" onClick={() => void handleDelete(address.id)} type="button">Delete</button>
                      {!address.is_default ? (
                        <button className="text-[11px] font-bold text-black/70" onClick={() => void handleSetDefault(address.id)} type="button">Set Default</button>
                      ) : null}
                    </div>
                  </div>
                ))
              : null}
          </div>
        </div>
      </motion.div>
    </Reveal>
  );
}
