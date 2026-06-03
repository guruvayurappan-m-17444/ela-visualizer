import { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './features/Dashboard';
import LogCollection from './features/LogCollection';
import LogParsing from './features/LogParsing';
import Alerting from './features/Alerting';
import Reporting from './features/Reporting';
import Compliance from './features/Compliance';
import Correlation from './features/Correlation';

const VIEWS = {
  'dashboard':      Dashboard,
  'log-collection': LogCollection,
  'log-parsing':    LogParsing,
  'alerting':       Alerting,
  'reporting':      Reporting,
  'compliance':     Compliance,
  'correlation':    Correlation,
};

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const ActivePage = VIEWS[activeView] || Dashboard;

  return (
    <div className="app-shell">
      <Header />
      <div className="app-body">
        <Sidebar activeView={activeView} onSelect={setActiveView} />
        <main className="app-main">
          <ActivePage onNavigate={setActiveView} />
        </main>
      </div>
    </div>
  );
}

export default App;
