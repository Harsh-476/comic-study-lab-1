// page14.jsx — Creatives: Videos (USER view page)
// Users can view uploads posted by admin; no upload form shown

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./page14.css";

import doodle from "./assets/curl.png";
import leaf   from "./assets/leaf.png";
import star   from "./assets/star.png";

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

const Videos = () => {
  const navigate = useNavigate();

  const token = useMemo(() => localStorage.getItem("cs_lab_token"), []);

  const [uploads, setUploads]   = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError]       = useState(null);

  /* ── guard + fetch ── */
  useEffect(() => {
    if (!token) {
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
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchUploads();
    return () => { cancelled = true; };
  }, [navigate, token]);

  const handleLogout = () => {
    localStorage.removeItem("cs_lab_token");
    localStorage.removeItem("cs_lab_user");
    navigate("/page7", { replace: true });
  };

  const handleOpen = (upload) => {
    if (!upload.fileUrl) return;
    window.open(buildFileUrl(import.meta.env.VITE_API_URL, upload.fileUrl), "_blank", "noopener,noreferrer");
  };

  const handleDownload = async (upload) => {
    if (!upload.fileUrl) return;
    try {
      const res  = await fetch(buildFileUrl(import.meta.env.VITE_API_URL, upload.fileUrl));
      if (!res.ok) throw new Error("Download failed.");
      const blob    = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a       = document.createElement("a");
      a.href        = blobUrl;
      a.download    = upload.originalName || "download";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setError(err.message);
    }
  };

  const renderPreview = (upload) => {
    if (!upload.fileUrl || !upload.fileType) return null;
    const url = buildFileUrl(import.meta.env.VITE_API_URL, upload.fileUrl);
    if (upload.fileType.startsWith("image/"))
      return (
        <img
          src={url}
          alt={upload.originalName}
          style={{ width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 4, marginBottom: 6 }}
        />
      );
    if (upload.fileType.startsWith("video/"))
      return (
        <video controls style={{ width: "100%", maxHeight: 160, marginBottom: 6 }}>
          <source src={url} type={upload.fileType} />
        </video>
      );
    if (upload.fileType.startsWith("audio/"))
      return <audio controls style={{ width: "100%", marginBottom: 6 }}><source src={url} type={upload.fileType} /></audio>;
    if (upload.fileType === "application/pdf")
      return <iframe src={url} title={upload.originalName} style={{ width: "100%", height: 120, marginBottom: 6 }} />;
    return null;
  };

  return (
    <div className="Videos-container">
      <div className="title">Creatives: Videos</div>
      <button className="logout" onClick={handleLogout}>LOG OUT</button>

      {/* DOODLES */}
      <img src={doodle} className="img curl-top-left" alt="doodle" />
      <img src={doodle} className="img curl-right"    alt="doodle" />

      {/* LEAVES */}
      <img src={leaf} className="img leaf-left"      alt="leaf" />
      <img src={leaf} className="img leaf-right-top" alt="leaf" />
      <img src={leaf} className="img leaf-right-mid" alt="leaf" />

      {/* STARS */}
      <img src={star} className="img star-left"   alt="star" />
      <img src={star} className="img star-bottom" alt="star" />
      <img src={star} className="img star-top1"   alt="star" />
      <img src={star} className="img star-top2"   alt="star" />

      {/* Uploads feed */}
      <div style={{
        position: "absolute",
        top: 130,
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(680px, 90vw)",
        maxHeight: "calc(100vh - 160px)",
        overflowY: "auto",
        zIndex: 10,
      }}>
        {isLoading && (
          <p style={{ textAlign: "center", color: "#4f634f", fontFamily: "sans-serif" }}>Loading…</p>
        )}
        {error && (
          <p style={{ textAlign: "center", color: "#c0392b", fontFamily: "sans-serif" }}>{error}</p>
        )}
        {!isLoading && !error && uploads.length === 0 && (
          <p style={{ textAlign: "center", color: "#999", fontFamily: "sans-serif", fontStyle: "italic" }}>
            No posts yet.
          </p>
        )}
        {uploads.map((u) => (
          <div key={u._id} style={{
            background: "rgba(255,255,255,0.88)",
            border: "1.5px solid #ccc",
            borderRadius: 8,
            padding: "14px 18px",
            marginBottom: 16,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}>
            {renderPreview(u)}
            <p style={{ margin: "0 0 4px", fontWeight: 700, fontFamily: "sans-serif", color: "#333" }}>
              {u.originalName || u.description?.slice(0, 60) || "Untitled"}
            </p>
            {u.description && (
              <p style={{ margin: "0 0 8px", fontSize: "0.88rem", color: "#555", fontFamily: "sans-serif" }}>
                {u.description}
              </p>
            )}
            {u.link && (
              <a href={u.link} target="_blank" rel="noreferrer"
                style={{ display: "block", marginBottom: 8, fontSize: "0.85rem", color: "#4f634f" }}>
                Visit Link →
              </a>
            )}
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              {u.fileUrl && (
                <>
                  <button onClick={() => handleOpen(u)} style={btnStyle}>View</button>
                  <button onClick={() => handleDownload(u)} style={btnStyle}>Download</button>
                </>
              )}
              <span style={{ marginLeft: "auto", fontSize: "0.72rem", color: "#aaa", fontFamily: "sans-serif" }}>
                {formatFileSize(u.fileSize)} · {new Date(u.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const btnStyle = {
  fontSize: "0.78rem",
  fontWeight: 700,
  letterSpacing: "1.5px",
  padding: "5px 18px",
  border: "1.5px solid #4f634f",
  background: "transparent",
  color: "#4f634f",
  cursor: "pointer",
  borderRadius: 4,
};

export default Videos;