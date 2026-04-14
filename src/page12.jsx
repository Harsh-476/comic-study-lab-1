import React from "react";
import { useNavigate } from "react-router-dom";
import "./page12.css";

import curl from "./assets/curl.png";
import leaf from "./assets/leaf.png";
import star from "./assets/star.png";

const Creatives = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("cs_lab_token");
    localStorage.removeItem("cs_lab_user");
    navigate("/page7", { replace: true });
  };

  return (
    <div className="page12-container">
      {/* Google Font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Give+You+Glory&display=swap"
        rel="stylesheet"
      />

      <div className="title">Creatives: Comics</div>
      <button className="logout" onClick={handleLogout}>LOG OUT</button>

      {/* DOODLES */}
      <img src={curl} className="img curl-top-left" alt="" />
      <img src={curl} className="img curl-right" alt="" />

      {/* LEAVES */}
      <img src={leaf} className="img leaf-left" alt="" />
      <img src={leaf} className="img leaf-right-top" alt="" />
      <img src={leaf} className="img leaf-right-mid" alt="" />

      {/* STARS */}
      <img src={star} className="img star-left" alt="" />
      <img src={star} className="img star-bottom" alt="" />
      <img src={star} className="img star-top1" alt="" />
      <img src={star} className="img star-top2" alt="" />
    </div>
  );
};

export default Creatives;
