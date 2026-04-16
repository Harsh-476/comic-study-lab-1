// Creatives Hub — PDF pages 9 & 10
// Zigzag layout:
//   Creatives: Projects  → top-right
//   Creatives: Comics    → middle-left
//   Creatives: Videos    → lower-right
// All bg decorative elements placed individually
// to match exact screenshot positions.

import React from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import star  from "./assets/star.png";
import leaf  from "./assets/leaf.png";
import swirl from "./assets/curl.png";
import s1 from "./assets/s1.png";
import s2 from "./assets/s2.png";
import s3 from "./assets/s3.png";
import s4 from "./assets/s4.png";
import "./page8.css";

function Page8() {
  const location = useLocation();
  const storedUser = localStorage.getItem("cs_lab_user");
  let isAdmin = false;

  if (storedUser) {
    try {
      isAdmin = JSON.parse(storedUser)?.role === "admin";
    } catch {
      localStorage.removeItem("cs_lab_user");
    }
  }

  const projectsPath = "/page9";
  const comicsPath = "/page11";
  const videosPath = "/page13";

  return (
    <div className="page8-container">

      {/* ── Navbar top-right ── */}
      <Navbar />

      {/* ── Background decorative elements (individually placed) ── */}

      {/* Swirl — top-left corner */}
      <img src={swirl} alt="" className="page8-bg-item page8-swirl1" />

      {/* Two stars — top-right stacked */}
      <img src={star}  alt="" className="page8-bg-item page8-star3" />
      <img src={star}  alt="" className="page8-bg-item page8-star4" />

      {/* Leaf — top-right */}
      <img src={leaf}  alt="" className="page8-bg-item page8-leaf2" />

      {/* Leaf — middle-left */}
      <img src={leaf}  alt="" className="page8-bg-item page8-leaf3" />

      {/* Leaf — middle-right */}
      <img src={leaf}  alt="" className="page8-bg-item page8-leaf1" />

      {/* Star — left-middle */}
      <img src={star}  alt="" className="page8-bg-item page8-star1" />

      {/* Star — center-lower */}
      <img src={star}  alt="" className="page8-bg-item page8-star2" />

      {/* Swirl — right-middle */}
      <img src={swirl} alt="" className="page8-bg-item page8-swirl2" />

      {/* ── Zigzag navigation links ── */}

      {/* TOP-RIGHT: Creatives: Projects */}
      <Link
        to={projectsPath}
        className={`page8-link link-projects${location.pathname === projectsPath ? " active" : ""}`}
      >
        Creatives: Projects
      </Link>

      {/* MIDDLE-LEFT: Creatives: Comics */}
      <Link
        to={comicsPath}
        className={`page8-link link-comics${location.pathname === comicsPath ? " active" : ""}`}
      >
        Creatives: Comics
      </Link>

      {/* LOWER-RIGHT: Creatives: Videos */}
      <Link
        to={videosPath}
        className={`page8-link link-videos${location.pathname === videosPath ? " active" : ""}`}
      >
        Creatives: Videos
      </Link>

      {/* ── Character figures — bottom-left ── */}
      <img src={s1} alt="Character 1" className="page8-char page8-c1" />
      <img src={s2} alt="Character 2" className="page8-char page8-c2" />
      <img src={s3} alt="Character 3" className="page8-char page8-c3" />
      <img src={s4} alt="Character 4" className="page8-char page8-c4" />

    </div>
  );
}

export default Page8;
