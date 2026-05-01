import { Link } from 'react-router-dom';
import AboutCard from '../components/AboutCard';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function About() {
  useDocumentTitle('About');
  return (
    <div className="page about-page">
      <section className="about-cluster-stage">
        <div className="about-copy">
          <header className="page-header">
            <h1>About Grounded Palette</h1>
          </header>

          <div className="prose">
            <p>
              Grounded Palette is a fan-made tool for finding gorgeous block combinations to use
              in your <strong>Grounded 2</strong> base builds. It's inspired by{' '}
              <a href="https://www.blockpalettes.com/" target="_blank" rel="noreferrer">
                blockpalettes.com
              </a>{' '}
              (the Minecraft community's palette site) — same idea, but for the backyard.
            </p>

            <p>
              Browse curated palettes, save your favorites, or compose your own from the full
              Grounded 2 building set: grass, weed stem, mushroom brick, pumpkin brick, pinecone
              shingles, snake scale, and the rest.
            </p>

            <p>
              Block data and images are pulled from the{' '}
              <a
                href="https://grounded.wiki.gg/wiki/Base_Building_(Grounded_2)"
                target="_blank"
                rel="noreferrer"
              >
                Grounded Wiki
              </a>
              . Not affiliated with Obsidian Entertainment or Microsoft — just a fan project.
            </p>

            <p>
              <Link to="/create" className="btn btn-primary">
                Make your first palette
              </Link>
            </p>

            <h2 className="about-links-heading">Links &amp; other builds</h2>
            <ul className="about-links">
              <li>
                <a
                  href="https://github.com/trippster56/groundedpalette"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub — open source repo for this site
                </a>
              </li>
              <li>
                <a href="https://tripplisenby.com" target="_blank" rel="noreferrer">
                  tripplisenby.com — my personal site with all my projects
                </a>
              </li>
              <li>
                <a href="https://trippledprints.com" target="_blank" rel="noreferrer">
                  trippledprints.com — 3D prints &amp; designs
                </a>
              </li>
            </ul>
          </div>
        </div>

        <AboutCard />
      </section>
    </div>
  );
}
