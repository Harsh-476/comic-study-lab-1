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
      <div className="title">Creatives: Projects</div>
      <button className="logout" onClick={handleLogout}>LOG OUT</button>

      {/* DOODLES */}
      <img src={doodle} className="img curl-top-left" alt="doodle" />
      <img src={doodle} className="img curl-right" alt="doodle" />

      {/* LEAVES */}
      <img src={leaf} className="img leaf-left" alt="leaf" />
      <img src={leaf} className="img leaf-right-top" alt="leaf" />
      <img src={leaf} className="img leaf-right-mid" alt="leaf" />

      {/* STARS */}
      <img src={star} className="img star-left" alt="star" />
      <img src={star} className="img star-bottom" alt="star" />
      <img src={star} className="img star-top1" alt="star" />
      <img src={star} className="img star-top2" alt="star" />
    </div>
  );
};

export default Projects;
