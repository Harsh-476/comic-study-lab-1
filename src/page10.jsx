import React from "react";
<<<<<<< HEAD
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
=======
import "./CreativesProjects.css";

const CreativesProjects = () => {
  return (
    <div className="container">
      {/* Title */}
      <div className="title">Creatives: Projects</div>

      {/* Logout */}
      <div className="logout">LOG OUT</div>
>>>>>>> 8ecd37a (Updated font)

      {/* DOODLES */}
      <img src="/images/doodle.png" alt="doodle" className="img curl-top-left" />
      <img src="/images/doodle.png" alt="doodle" className="img curl-right" />

      {/* LEAVES */}
      <img src="/images/leaf.png" alt="leaf" className="img leaf-left" />
      <img src="/images/leaf.png" alt="leaf" className="img leaf-right-top" />
      <img src="/images/leaf.png" alt="leaf" className="img leaf-right-mid" />

      {/* STARS */}
      <img src="/images/star.png" alt="star" className="img star-left" />
      <img src="/images/star.png" alt="star" className="img star-bottom" />
      <img src="/images/star.png" alt="star" className="img star-top1" />
      <img src="/images/star.png" alt="star" className="img star-top2" />
    </div>
  );
};

<<<<<<< HEAD
export default Projects;
=======
export default CreativesProjects;
>>>>>>> 8ecd37a (Updated font)
