import React from "react";
import { useNavigate } from "react-router-dom";
import "./page10.css";

import doodle from "./assets/curl.png";
import leaf from "./assets/leaf.png";
import star from "./assets/star.png";

const Projects = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("cs_lab_token");
    localStorage.removeItem("cs_lab_user");
    navigate("/page7", { replace: true });
  };

  return (
    <div className="projects-container">
      {/* Title */}
      <div className="title">Creatives: Projects</div>

      {/* Logout */}
      <button className="logout" onClick={handleLogout}>
        LOG OUT
      </button>

      {/* DOODLES */}
      <img src={doodle} alt="doodle" className="img curl-top-left" />
      <img src={doodle} alt="doodle" className="img curl-right" />

      {/* LEAVES */}
      <img src={leaf} alt="leaf" className="img leaf-left" />
      <img src={leaf} alt="leaf" className="img leaf-right-top" />
      <img src={leaf} alt="leaf" className="img leaf-right-mid" />

      {/* STARS */}
      <img src={star} alt="star" className="img star-left" />
      <img src={star} alt="star" className="img star-bottom" />
      <img src={star} alt="star" className="img star-top1" />
      <img src={star} alt="star" className="img star-top2" />
    </div>
  );
};

export default Projects;