import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Browse from './pages/Browse';
import PaletteDetail from './pages/PaletteDetail';
import Create from './pages/Create';
import Library from './pages/Library';
import About from './pages/About';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import MyPalettes from './pages/MyPalettes';
import { useDocumentTitle } from './hooks/useDocumentTitle';
import './app.css';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="browse" element={<Browse />} />
        <Route path="palette/:id" element={<PaletteDetail />} />
        <Route path="create" element={<Create />} />
        <Route path="blocks" element={<Library />} />
        <Route path="about" element={<About />} />
        <Route path="sign-in" element={<SignIn />} />
        <Route path="sign-up" element={<SignUp />} />
        <Route path="me" element={<MyPalettes />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

function NotFound() {
  useDocumentTitle('Not found');
  return (
    <div className="page notfound-page">
      <div className="notfound">
        <div className="notfound-icon">🍂</div>
        <h1>Lost in the leaves</h1>
        <p className="page-sub">
          That page isn't here. Maybe a stink bug carried it off.
        </p>
        <div className="hero-actions" style={{ justifyContent: 'center' }}>
          <a className="btn btn-primary" href="/">Home</a>
          <a className="btn btn-secondary" href="/browse">Browse palettes</a>
        </div>
      </div>
    </div>
  );
}
