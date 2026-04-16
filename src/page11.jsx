// page11.jsx — Creatives: Comics (ADMIN upload page)
// Admin only: can post; redirects non-admins back to login

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./page11.css";

const MAX_WORDS = 1000;
const countWords = (text = "") =>
  text.trim().split(/\s+/).filter(Boolean).length;

const buildFileUrl = (baseUrl, relativeUrl) => {
  if (!baseUrl) {
    try { return new URL(relativeUrl).href; } catch { return relativeUrl; }
  }
  try { return new URL(relativeUrl, baseUrl).href; }
  catch { return `${baseUrl.replace(/\/$/, "")}${relativeUrl}`; }
};

const formatFileSize = (bytes) => {
  if (bytes == null || Number.isNaN(bytes)) return "–";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function CreativesComics() {
  const navigate = useNavigate();

  /* ── auth ── */
  const token = useMemo(() => localStorage.getItem("cs_lab_token"), []);
  const user = useMemo(() => {
    const stored = localStorage.getItem("cs_lab_user");
    if (!stored) return null;
    try { return JSON.parse(stored); }
    catch { localStorage.removeItem("cs_lab_user"); return null; }
  }, []);
  const isAdmin = user?.role === "admin";

  /* ── state ── */
  const [description, setDescription] = useState("");
  const [link, setLink]               = useState("");
  const [file, setFile]               = useState(null);
  const [fileName, setFileName]       = useState("No file chosen");
  const fileInputRef                  = useRef(null);

  const [uploads, setUploads]   = useState([]);
  const [status, setStatus]     = useState(null);
  const [isLoading, setLoading] = useState(true);

  /* ── guard: must be logged-in admin ── */
  useEffect(() => {
    if (!token || !isAdmin) {
      navigate("/page7", { replace: true });
      return;
    }
    let cancelled = false;

    const fetchUploads = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/uploads`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("cs_lab_token");
          localStorage.removeItem("cs_lab_user");
          navigate("/page7", { replace: true });
          return;
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Could not load posts");
        if (!cancelled) setUploads(data);
      } catch (err) {
        if (!cancelled) setStatus({ type: "error", message: err.message });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchUploads();
    return () => { cancelled = true; };
  }, [navigate, token, isAdmin]);

  /* ── helpers ── */
  const isValidUrl = (v) => {
    try { return ["http:", "https:"].includes(new URL(v).protocol); }
    catch { return false; }
  };

  const handleLogout = () => {
    localStorage.removeItem("cs_lab_token");
    localStorage.removeItem("cs_lab_user");
    navigate("/page7", { replace: true });
  };

  /* ── upload (admin only) ── */
  const handleUpload = async () => {
    const trimDesc = description.trim();
    const trimLink = link.trim();

    if (!trimDesc && !trimLink && !file) {
      setStatus({ type: "error", message: "Add a description, link, or file before uploading." });
      return;
    }
    if (trimDesc && countWords(trimDesc) > MAX_WORDS) {
      setStatus({ type: "error", message: `Description exceeds ${MAX_WORDS} words.` });
      return;
    }
    if (trimLink && !isValidUrl(trimLink)) {
      setStatus({ type: "error", message: "Enter a valid URL (http:// or https://)." });
      return;
    }

    const formData = new FormData();
    if (trimDesc) formData.append("description", trimDesc);
    if (file)     formData.append("file", file);
    if (trimLink) formData.append("link", trimLink);

    try {
      setStatus(null);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/uploads`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}` },
        body:    formData,
      });

      if (res.status === 401) {
        localStorage.removeItem("cs_lab_token");
        localStorage.removeItem("cs_lab_user");
        navigate("/page7", { replace: true });
        return;
      }
      if (res.status === 403) {
        setStatus({ type: "error", message: "Only admins can upload posts." });
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed.");

      setUploads((prev) => [data, ...prev]);
      setDescription("");
      setLink("");
      setFile(null);
      setFileName("No file chosen");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setStatus({ type: "success", message: "Uploaded successfully!" });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  };

  /* ── delete (admin only) ── */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/uploads/${id}`, {
        method:  "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Delete failed.");
      }
      setUploads((prev) => prev.filter((u) => u._id !== id));
      setStatus({ type: "success", message: "Post deleted." });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  };

  const renderPreview = (upload) => {
    if (!upload.fileUrl || !upload.fileType) return null;
    const url = buildFileUrl(import.meta.env.VITE_API_URL, upload.fileUrl);
    if (upload.fileType.startsWith("image/"))
      return <img src={url} alt={upload.originalName} style={{ maxWidth: "100%", maxHeight: 80, objectFit: "cover" }} />;
    if (upload.fileType === "application/pdf")
      return <a href={url} target="_blank" rel="noreferrer" style={{ fontSize: "0.75rem" }}>PDF</a>;
    return <a href={url} target="_blank" rel="noreferrer" style={{ fontSize: "0.75rem" }}>Open file</a>;
  };

  return (
    <div className="page11-shell">
      <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Kalam:wght@300;400;700&family=Lato:wght@400;700&display=swap" rel="stylesheet"/>

      {/* Decorative Layer */}
      <div className="deco d-star-tr"><span className="star-glyph">✳</span></div>
      <div className="deco d-star-tr2"><span className="star-glyph sm">✳</span></div>
      <div className="deco d-star-ml"><span className="star-glyph">✳</span></div>
      <div className="deco d-star-mid"><span className="star-glyph">✳</span></div>

      <div className="deco d-swirl-tl">
        <svg width="58" height="42">
          <path d="M6 36 C6 36 10 10 32 5 C44 2 50 14 38 21" stroke="#3d6b45" strokeWidth="2.3" fill="none"/>
        </svg>
      </div>
      <div className="deco d-swirl-br">
        <svg width="58" height="42">
          <path d="M6 6 C6 6 10 32 32 37 C44 40 50 28 38 21" stroke="#3d6b45" strokeWidth="2.3" fill="none"/>
        </svg>
      </div>
      <div className="deco d-leaf-ml">
        <svg width="26" height="38">
          <path d="M13 36 C13 36 1 22 6 8 C10 0 22 3 19 14 C17 22 8 24 13 36Z" fill="#4a7a52"/>
        </svg>
      </div>
      <div className="deco d-leaf-mr">
        <svg width="34" height="48">
          <path d="M17 46 C17 46 2 28 7 10 C11 0 28 2 26 18 C24 30 11 32 17 46Z" fill="#4a7a52"/>
        </svg>
      </div>

      {/* Page */}
      <div className="page">
        <header>
          <h1 className="site-title">Creatives: Comics</h1>
          <button className="logout-btn" onClick={handleLogout}>LOG OUT</button>
        </header>

        <main>
          {/* LEFT — New Post (admin) */}
          <section>
            <h2 className="new-post-heading">New Post</h2>

            <label className="field-label">Description</label>
            <textarea
              className="description-box"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the piece…"
            />
            <span style={{ fontSize: "0.75rem", color: "#999", display: "block", marginBottom: 8 }}>
              {countWords(description)}/{MAX_WORDS} words
            </span>

            <div className="link-row">
              <span className="link-label-inline">Link</span>
              <input
                className="link-input"
                type="url"
                placeholder="https://example.com"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>

            <div className="file-row">
              <span className="file-label-inline">File</span>
              <input
                type="file"
                id="file-input-p11"
                ref={fileInputRef}
                accept="image/*,video/*,audio/*,application/pdf"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setFile(f);
                  setFileName(f ? f.name : "No file chosen");
                }}
              />
              <label htmlFor="file-input-p11" className="browse-btn">Browse</label>
              <span className="file-chosen">{fileName}</span>
            </div>

            {status && (
              <p style={{
                fontSize: "0.82rem",
                color: status.type === "error" ? "#c0392b" : "#3d6b45",
                marginBottom: 8,
              }}>
                {status.message}
              </p>
            )}

            <div className="upload-btn-wrap">
              <button className="upload-btn" onClick={handleUpload}>UPLOAD</button>
            </div>
          </section>

          {/* RIGHT — Recent Posts */}
          <aside>
            <h2 className="recent-heading">Recent Posts</h2>
            {isLoading ? (
              <p className="posts-empty">Loading…</p>
            ) : uploads.length === 0 ? (
              <p className="posts-empty">No posts yet.</p>
            ) : (
              <div style={{ marginTop: 12 }}>
                {uploads.map((u) => (
                  <div key={u._id} style={{
                    borderBottom: "1px solid #ddd",
                    paddingBottom: 10,
                    marginBottom: 10,
                  }}>
                    {renderPreview(u)}
                    <p style={{ fontSize: "0.8rem", fontWeight: 700, margin: "4px 0 2px" }}>
                      {u.originalName || u.description?.slice(0, 40) || "Untitled"}
                    </p>
                    {u.description && (
                      <p style={{ fontSize: "0.75rem", color: "#555", margin: 0 }}>
                        {u.description.slice(0, 80)}{u.description.length > 80 ? "…" : ""}
                      </p>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                      <span style={{ fontSize: "0.7rem", color: "#aaa" }}>
                        {formatFileSize(u.fileSize)} · {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleDelete(u._id)}
                        style={{
                          fontSize: "0.7rem",
                          background: "none",
                          border: "none",
                          color: "#c0392b",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </main>
      </div>
    </div>
  );
}
