import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import LogCollection from './components/LogCollection/LogCollection';
import LogParsing from './components/LogParsing/LogParsing';
import Alerting from './components/Alerting/Alerting';
import Reporting from './components/Reporting/Reporting';
import Compliance from './components/Compliance/Compliance';
import Correlation from './components/Correlation/Correlation';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/log-collection" element={<LogCollection />} />
        <Route path="/log-parsing" element={<LogParsing />} />
        <Route path="/alerting" element={<Alerting />} />
        <Route path="/reporting" element={<Reporting />} />
        <Route path="/compliance" element={<Compliance />} />
        <Route path="/correlation" element={<Correlation />} />
      </Routes>
    </Layout>
  );
}

export default App;
