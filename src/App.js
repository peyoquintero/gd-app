import './App.css';
import React, { useState } from "react";
import { BrowserRouter, Routes,Route, Switch } from "react-router-dom";

const Tabs = ({ tabs, activeTab }) => {
  const [currentTab, setCurrentTab] = useState(activeTab || tabs[0].name);

  const handleTabChange = (tabName) => {
    setCurrentTab(tabName);
  };

  return (
    <div>
      <ul>
        {tabs.map((tab) => (
          <li key={tab.name}>
            <a href="#" onClick={() => handleTabChange(tab.name)}>
              {tab.name}
            </a>
          </li>
        ))}
      </ul>
      <div>
      <Routes>
        {tabs.map((tab) => (
          <Route
            key={tab.name}
            path={`/${tab.name}`}
            render={() => tab.content}
          />
        ))}
        </Routes>
      </div>
    </div>
  );
};

const App = () => {
  const tabs = [
    { name: "Home", content: <h1>Home</h1> },
    { name: "About", content: <h1>About</h1> },
    { name: "Contact", content: <h1>Contact</h1> },
  ];

  const activeTab = "Home";

  return (
    <BrowserRouter>
      <Tabs tabs={tabs} activeTab={activeTab} />
    </BrowserRouter>
  );
};

export default App;