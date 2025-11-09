import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./app/pages/Home";
import Donator from "./app/pages/Donator";
import NgoNewCampaign from "./app/pages/NgoNewCampaign";
import Layout from "./app/pages/Layout";

const App: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/donator" element={<Donator />} />
        <Route path="/ngo/new" element={<NgoNewCampaign />} />
      </Routes>
    </Layout>
  );
};

export default App;
