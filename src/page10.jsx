import React from "react";
import "./Projects.css";

import doodle from "./doodle.png";
import leaf from "./leaf.png";
import star from "./star.png";

const Projects = () => {
  return (
    <div className="projects-container">
      <div className="title">Creatives: PRojects</div>
      <div className="logout">LOG OUT</div>

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