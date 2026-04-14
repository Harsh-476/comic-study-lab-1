import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./page13.css";

export default function CreativesVideos() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("cs_lab_token");
    localStorage.removeItem("cs_lab_user");
    navigate("/page7", { replace: true });
  };

  useEffect(() => {
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.getElementById('upload-btn');

    if (fileInput) {
      fileInput.addEventListener('change', function () {
        document.getElementById('file-name').textContent =
          this.files.length ? this.files[0].name : 'No file chosen';
      });
    }

    if (uploadBtn) {
      uploadBtn.addEventListener('click', function () {
        const desc = document.getElementById('description').value.trim();

        if (!desc) {
          const ta = document.getElementById('description');
          ta.style.borderColor = '#c0392b';
          ta.focus();
          setTimeout(() => ta.style.borderColor = '', 1800);
          return;
        }

        const orig = this.textContent;
        this.textContent = 'UPLOADED ✓';
        this.style.cssText = 'background:#3d6b45;color:#fff;border-color:#3d6b45';

        setTimeout(() => {
          this.textContent = orig;
          this.style.cssText = '';
        }, 2500);
      });
    }
  }, []);

  return (
    <div className="page13-shell">

      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Kalam:wght@300;400;700&family=Lato:wght@400;700&display=swap" rel="stylesheet"/>

      {/* Decorative Layer */}
      <div className="deco d-star-tr"><span className="star-glyph">✳</span></div>
      <div className="deco d-star-tr2"><span className="star-glyph sm">✳</span></div>
      <div className="deco d-star-ml"><span className="star-glyph">✳</span></div>
      <div className="deco d-star-mid"><span className="star-glyph">✳</span></div>

      <div className="deco d-swirl-tl">
        <svg width="58" height="42">
          <path d="M6 36 C6 36 10 10 32 5 C44 2 50 14 38 21"
            stroke="#3d6b45" strokeWidth="2.3" fill="none"/>
        </svg>
      </div>

      <div className="deco d-swirl-br">
        <svg width="58" height="42">
          <path d="M6 6 C6 6 10 32 32 37 C44 40 50 28 38 21"
            stroke="#3d6b45" strokeWidth="2.3" fill="none"/>
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
          <h1 className="site-title">Creatives: Videos</h1>
          <button className="logout-btn" onClick={handleLogout}>LOG OUT</button>
        </header>

        <main>

          <section>
            <h2 className="new-post-heading">New Post</h2>

            <label className="field-label">Description</label>
            <textarea className="description-box" id="description"></textarea>

            <div className="link-row">
              <span className="link-label-inline">Link</span>
              <input className="link-input" type="url" id="post-link"/>
            </div>

            <div className="file-row">
              <span className="file-label-inline">File</span>
              <input type="file" id="file-input"/>
              <label htmlFor="file-input" className="browse-btn">Browse</label>
              <span className="file-chosen" id="file-name">No file chosen</span>
            </div>

            <div className="upload-btn-wrap">
              <button className="upload-btn" id="upload-btn">UPLOAD</button>
            </div>
          </section>

          <aside>
            <h2 className="recent-heading">Recent Posts</h2>
            <p className="posts-empty">No posts yet.</p>
          </aside>

        </main>
      </div>

    </div>
  );
}
