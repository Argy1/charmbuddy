"use client";

import { useEffect, useState } from "react";

import { adminCreateFaqApi, adminDeleteFaqApi, adminListFaqsApi, adminUpdateFaqApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { FaqEntry } from "@/lib/api/types";
import { useAuth } from "@/lib/auth-context";

export default function AdminFaqsPage() {
  const { token, isAuthResolved } = useAuth();
  const [faqs, setFaqs] = useState<FaqEntry[]>([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [editingFaqId, setEditingFaqId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadFaqs = async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await adminListFaqsApi(token);
      setFaqs(response.data);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Gagal memuat FAQ.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthResolved || !token) {
      return;
    }
    void loadFaqs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthResolved, token]);

  const resetForm = () => {
    setQuestion("");
    setAnswer("");
    setEditingFaqId(null);
  };

  const handleSubmit = async () => {
    if (!token || !question.trim() || !answer.trim()) {
      setErrorMessage("Question dan answer wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      if (editingFaqId) {
        await adminUpdateFaqApi(token, editingFaqId, { question: question.trim(), answer: answer.trim() });
      } else {
        await adminCreateFaqApi(token, { question: question.trim(), answer: answer.trim() });
      }
      await loadFaqs();
      resetForm();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Gagal menyimpan FAQ.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const beginEdit = (faq: FaqEntry) => {
    setEditingFaqId(faq.id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setErrorMessage(null);
  };

  const handleDelete = async (faqId: number) => {
    if (!token) {
      return;
    }
    if (!window.confirm("Hapus FAQ ini?")) {
      return;
    }

    try {
      await adminDeleteFaqApi(token, faqId);
      await loadFaqs();
      if (editingFaqId === faqId) {
        resetForm();
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Gagal menghapus FAQ.");
      }
    }
  };

  return (
    <div className="space-y-[12px]">
      <section className="rounded-[18px] border border-black/10 bg-white/70 p-[12px]">
        <h1 className="font-[var(--font-fanlste)] text-[30px] tracking-[1px]">FAQ Management</h1>
        <p className="font-[var(--font-satoshi)] text-[14px] text-black/65">Kelola daftar pertanyaan yang tampil di halaman FAQ dan homepage.</p>
      </section>

      <section className="rounded-[18px] border border-black/10 bg-white/75 p-[12px]">
        <input className="h-[40px] w-full rounded-[10px] border border-black/20 bg-white px-[10px]" onChange={(e) => setQuestion(e.target.value)} placeholder="Question" value={question} />
        <textarea className="mt-[8px] h-[120px] w-full rounded-[10px] border border-black/20 bg-white px-[10px] py-[8px]" onChange={(e) => setAnswer(e.target.value)} placeholder="Answer" value={answer} />
        <div className="mt-[8px] flex gap-[8px]">
          <button className="h-[38px] rounded-[10px] bg-black px-[12px] text-white disabled:opacity-60" disabled={isSubmitting} onClick={() => void handleSubmit()} type="button">
            {isSubmitting ? "Saving..." : editingFaqId ? "Update" : "Create"}
          </button>
          {editingFaqId ? (
            <button className="h-[38px] rounded-[10px] border border-black/20 px-[12px]" onClick={resetForm} type="button">
              Cancel
            </button>
          ) : null}
        </div>
      </section>

      {errorMessage ? <p className="text-[13px] text-red-600">{errorMessage}</p> : null}

      <section className="rounded-[18px] border border-black/10 bg-white/75 p-[12px]">
        {isLoading ? <p className="text-[13px] text-black/65">Loading FAQ...</p> : null}
        {!isLoading && faqs.length === 0 ? <p className="text-[13px] text-black/65">Belum ada FAQ.</p> : null}
        <div className="space-y-[8px]">
          {faqs.map((faq) => (
            <div className="rounded-[10px] border border-black/10 bg-white px-[10px] py-[8px]" key={faq.id}>
              <p className="text-[14px] font-bold">{faq.question}</p>
              <p className="mt-[4px] text-[12px] text-black/70">{faq.answer}</p>
              <div className="mt-[6px] flex gap-[8px]">
                <button className="text-[12px] font-bold text-[#2d44cf]" onClick={() => beginEdit(faq)} type="button">
                  Edit
                </button>
                <button className="text-[12px] font-bold text-red-600" onClick={() => void handleDelete(faq.id)} type="button">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
