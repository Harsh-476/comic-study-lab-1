// projectsPage.jsx  ─  Canva page 9 (Admin) / page 10 (User)
// Admin → sees "New Post" form + "Recent Posts"
// User  → sees "Recent Posts" only (view-only, no upload controls)
//         + "Creatives: Projects" button → navigates to /page10

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Bg from "./components/bg.jsx";
import "./page9.css";
import { BASE_URL, apiFetch } from "./lib/api";

/* ── helpers ─────────────────────────────────────────────────── */
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

/* ── component ───────────────────────────────────────────────── */
function Page9() {
  const navigate = useNavigate();

  /* auth */
  const token = useMemo(() => localStorage.getItem("cs_lab_token"), []);
  const user = useMemo(() => {
    const stored = localStorage.getItem("cs_lab_user");
    if (!stored) return null;
    try { return JSON.parse(stored); }
    catch { localStorage.removeItem("cs_lab_user"); return null; }
  }, []);
  const isAdmin = user?.role === "admin";

  /* form state (admin only) */
  const [description, setDescription] = useState("");
  const [link, setLink]               = useState("");
  const [file, setFile]               = useState(null);
  const fileInputRef                  = useRef(null);

  /* shared state */
  const [uploads, setUploads]   = useState([]);
  const [status, setStatus]     = useState(null);
  const [isLoading, setLoading] = useState(true);

  /* ── auth guard ── */
  useEffect(() => {
    if (!token) {
      navigate("/page7", { replace: true });
      return;
    }

    let cancelled = false;

    const fetchUploads = async () => {
      try {
        const res = await apiFetch("/api/uploads", {
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
  }, [navigate, token]);

  /* ── handlers (admin) ── */
  const isValidUrl = (v) => {
    try { return ["http:", "https:"].includes(new URL(v).protocol); }
    catch { return false; }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;

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
      const res = await apiFetch("/api/uploads", {
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
      if (fileInputRef.current) fileInputRef.current.value = "";
      setStatus({ type: "success", message: "Uploaded successfully!" });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      const res = await apiFetch(`/api/uploads/${id}`, {
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

  const handleOpen = (upload) => {
    if (!upload.fileUrl) return;
    window.open(buildFileUrl(BASE_URL, upload.fileUrl), "_blank", "noopener,noreferrer");
  };

  const handleDownload = async (upload) => {
    if (!upload.fileUrl) return;
    try {
      const res  = await fetch(buildFileUrl(BASE_URL, upload.fileUrl));
      if (!res.ok) throw new Error("Download failed.");
      const blob    = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a       = document.createElement("a");
      a.href        = blobUrl;
      a.download    = upload.originalName || "download";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("cs_lab_token");
    localStorage.removeItem("cs_lab_user");
    navigate("/page7", { replace: true });
  };

  /* ── render helpers ── */
  const renderPreview = (upload) => {
    if (!upload.fileUrl || !upload.fileType)
      return <div className="page9-preview-placeholder">No file</div>;

    const url = buildFileUrl(BASE_URL, upload.fileUrl);
    if (upload.fileType.startsWith("image/"))
      return <img src={url} alt={upload.originalName} className="page9-preview-image" />;
    if (upload.fileType.startsWith("video/"))
      return (
        <video controls className="page9-preview-video">
          <source src={url} type={upload.fileType} />
        </video>
      );
    if (upload.fileType.startsWith("audio/"))
      return (
        <audio controls className="page9-preview-audio">
          <source src={url} type={upload.fileType} />
        </audio>
      );
    if (upload.fileType === "application/pdf")
      return <iframe src={url} title={upload.originalName} className="page9-preview-pdf" />;
    return <a href={url} className="page9-preview-link" target="_blank" rel="noreferrer">Open file</a>;
  };

  /* ── JSX ── */
  return (
    <div className="page9-container">
      <Bg style={{ backgroundColor: "#f5f2eb" }} />

      {/* ── Top bar ── */}
      <div className="page9-topbar">
        <button className="page9-logout" onClick={handleLogout}>LOG OUT</button>
      </div>

      {/* ── Page title ── */}
      <h1 className="page9-title">Creatives: Projects</h1>

      {/* ── Main layout ── */}
      <div className="page9-body">

        {/* LEFT — New Post (admin only) */}
        {isAdmin && (
          <section className="page9-left">
            <h2 className="page9-section-title">New Post</h2>

            <form className="page9-form" onSubmit={handleSubmit}>
              <label className="page9-label">
                Description
                <textarea
                  className="page9-textarea"
                  rows={7}
                  maxLength={8000}
                  placeholder="Describe the piece…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <span className="page9-wordcount">
                  {countWords(description)}/{MAX_WORDS} words
                </span>
              </label>

              <label className="page9-label page9-label-inline">
                Link
                <input
                  className="page9-input"
                  type="url"
                  placeholder="https://example.com"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </label>

              <label className="page9-label page9-label-inline">
                File
                <input
                  className="page9-file"
                  type="file"
                  ref={fileInputRef}
                  accept="image/*,video/*,audio/*,application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>

              <button type="submit" className="page9-upload-btn">UPLOAD</button>

              {status && (
                <p className={`page9-status page9-status-${status.type}`}>
                  {status.message}
                </p>
              )}
            </form>
          </section>
        )}

        {/* RIGHT — Recent Posts */}
        <section className={`page9-right ${!isAdmin ? "page9-right-full" : ""}`}>
          <h2 className="page9-section-title page9-recent-title">Recent Posts</h2>

          {/* user-only: status + Creatives: Projects button */}
          {!isAdmin && (
            <>
              {status && (
                <p className={`page9-status page9-status-${status.type}`}>{status.message}</p>
              )}
              <button
                className="page9-upload-btn"
                onClick={() => navigate("/page10")}
              >
                Creatives: Projects
              </button>
            </>
          )}

          {isLoading ? (
            <p className="page9-placeholder">Loading…</p>
          ) : uploads.length === 0 ? (
            <p className="page9-placeholder">No posts yet.</p>
          ) : (
            <div className="page9-grid">
              {uploads.map((upload) => (
                <article key={upload._id} className="page9-card">
                  <div className="page9-card-preview">{renderPreview(upload)}</div>
                  <div className="page9-card-meta">
                    <h3>{upload.originalName || upload.description || "Untitled"}</h3>
                    {upload.description && (
                      <p className="page9-card-desc">{upload.description}</p>
                    )}
                    {upload.link && (
                      <a href={upload.link} className="page9-card-link"
                         target="_blank" rel="noreferrer">
                        Visit Link
                      </a>
                    )}
                    {upload.fileUrl && (
                      <div className="page9-card-actions">
                        <button className="page9-card-btn" onClick={() => handleOpen(upload)}>
                          View
                        </button>
                        <button className="page9-card-btn" onClick={() => handleDownload(upload)}>
                          Download
                        </button>
                      </div>
                    )}
                    <div className="page9-card-footer">
                      <span>{formatFileSize(upload.fileSize)}</span>
                      <time>{new Date(upload.createdAt).toLocaleDateString()}</time>
                    </div>
                    {/* Delete — admin only */}
                    {isAdmin && (
                      <button className="page9-delete-btn" onClick={() => handleDelete(upload._id)}>
                        Delete
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Page9;
