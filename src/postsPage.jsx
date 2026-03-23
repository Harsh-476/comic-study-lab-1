import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Bg from "./components/bg.jsx";
import "./postsPage.css";
import { API_URL, apiFetch, withBase } from "./lib/api";

const buildFileUrl = (baseUrl, relativeUrl) => {
  try {
    return new URL(relativeUrl, baseUrl).href;
  } catch {
    return `${baseUrl.replace(/\/$/, "")}${relativeUrl}`;
  }
};

const formatFileSize = (bytes) => {
  if (bytes == null || Number.isNaN(bytes)) {
    return "-";
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

function PostsPage() {
  // API_URL is provided by src/lib/api and falls back to localhost with a warning when missing.
  const navigate = useNavigate();
  const [uploads, setUploads] = useState([]);
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const token = useMemo(() => localStorage.getItem("cs_lab_token"), []);
  const user = useMemo(() => {
    const stored = localStorage.getItem("cs_lab_user");
    if (!stored) {
      return null;
    }
    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem("cs_lab_user");
      return null;
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("cs_lab_token");
    localStorage.removeItem("cs_lab_user");
    navigate("/page7", { replace: true });
  };

  const handleOpen = (upload) => {
    if (!upload.fileUrl) {
      setStatus({ type: "error", message: "This post does not include a file to view." });
      return;
    }
    const fileUrl = buildFileUrl(API_URL || withBase(""), upload.fileUrl);
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  const handleDownload = async (upload) => {
    if (!upload.fileUrl) {
      setStatus({ type: "error", message: "This post does not include a file to download." });
      return;
    }

  const fileUrl = buildFileUrl(API_URL || withBase(""), upload.fileUrl);

    try {
      const response = await fetch(fileUrl);

      if (!response.ok) {
        throw new Error("Unable to download file. Please try again.");
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = upload.originalName || upload.fileName || "download";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/page7", { replace: true });
      return;
    }

    if (user?.role === "admin") {
      navigate("/dashboard", { replace: true });
      return;
    }

    let isCancelled = false;

    const fetchUploads = async () => {
      try {
        const response = await apiFetch(`/api/uploads`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          localStorage.removeItem("cs_lab_token");
          localStorage.removeItem("cs_lab_user");
          navigate("/page7", { replace: true });
          return;
        }

        if (response.status === 403) {
          localStorage.removeItem("cs_lab_token");
          localStorage.removeItem("cs_lab_user");
          navigate("/page7", { replace: true });
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load posts");
        }

        if (!isCancelled) {
          setUploads(data);
        }
      } catch (error) {
        if (!isCancelled) {
          setStatus({ type: "error", message: error.message });
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchUploads();

    return () => {
      isCancelled = true;
    };
  }, [API_URL, navigate, token, user]);

  const renderPreview = (upload) => {
    if (!upload.fileUrl || !upload.fileType) {
      return <div className="post-preview-placeholder">No file uploaded</div>;
    }

    const fileUrl = buildFileUrl(API_URL, upload.fileUrl);

    if (upload.fileType.startsWith("image/")) {
      return <img src={fileUrl} alt={upload.originalName} className="post-preview-image" />;
    }

    if (upload.fileType.startsWith("audio/")) {
      return (
        <audio controls className="post-preview-audio">
          <source src={fileUrl} type={upload.fileType} />
          Your browser does not support the audio element.
        </audio>
      );
    }

    if (upload.fileType.startsWith("video/")) {
      return (
        <video controls className="post-preview-video">
          <source src={fileUrl} type={upload.fileType} />
          Your browser does not support the video tag.
        </video>
      );
    }

    if (upload.fileType === "application/pdf") {
      return <iframe src={fileUrl} title={upload.originalName} className="post-preview-pdf" />;
    }

    return (
      <a href={fileUrl} className="post-preview-link" target="_blank" rel="noreferrer">
        Open {upload.originalName || "file"}
      </a>
    );
  };

  const renderActions = (upload) => (
    upload.fileUrl ? (
      <div className="post-actions">
        <button
          type="button"
          className="post-action-button"
          onClick={() => handleOpen(upload)}
        >
          View
        </button>
        <button
          type="button"
          className="post-action-button"
          onClick={() => handleDownload(upload)}
        >
          Download
        </button>
      </div>
    ) : null
  );

  return (
    <div className="posts-container">
      <Bg style={{ backgroundColor: "#f7f4ef" }} />
      <div className="posts-content">
        <header className="posts-header">
          <div className="posts-header-row">
            <h1>Community Archive</h1>
            <button type="button" className="logout-button" onClick={handleLogout}>
              Log out
            </button>
          </div>
          <p>Browse everything the lab has shared so far.</p>
        </header>

        {status && <p className={`posts-status posts-status-${status.type}`}>{status.message}</p>}

        {isLoading ? (
          <p className="posts-placeholder">Loading posts…</p>
        ) : uploads.length === 0 ? (
          <p className="posts-placeholder">No uploads yet. Check back soon.</p>
        ) : (
          <div className="posts-grid">
            {uploads.map((upload) => (
              <article key={upload._id} className="post-card">
                <div className="post-preview">{renderPreview(upload)}</div>
                <div className="post-meta">
                  <h3>{upload.originalName || upload.description || "Untitled post"}</h3>
                  <p className="post-description">
                    {upload.description || "No description provided."}
                  </p>
                  {upload.link && (
                    <a
                      href={upload.link}
                      className="post-external-link"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Visit Link
                    </a>
                  )}
                  {renderActions(upload)}
                  <div className="post-footer">
                    <span>{formatFileSize(upload.fileSize)}</span>
                    <time dateTime={upload.createdAt}>
                      {new Date(upload.createdAt).toLocaleString()}
                    </time>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PostsPage;
