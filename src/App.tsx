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
  return (
    <div className="page">
      <h1>Lost in the leaves</h1>
      <p className="page-sub">That page isn't here. Try Browse or Home.</p>
    </div>
  );
}
