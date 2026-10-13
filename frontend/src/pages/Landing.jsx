import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const features = [
  ['01', 'Search by area', 'Type your city or neighbourhood and see boarding houses near you.'],
  ['02', 'Compare rent & facilities', 'Monthly rent, room type, gender and facilities, side by side.'],
  ['03', 'Report wrong listings', 'Flag wrong info, full houses or scams so staff can act fast.'],
];
const steps = ['Create a free account', 'Search your area', 'Contact the owner directly', 'Report anything suspicious'];

const rise = (i = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5, delay: i * 0.08 },
});

export default function Landing() {
  return (
    <>
      <section className="hero">
        <span className="glass chip">Sri Lanka Boarding Houses</span>
        <h1>Find your <em>room</em> in seconds</h1>
        <p className="sub">
          Students, workers and tourists: know the rent, facilities and owner contact before you visit.
        </p>
        <div className="hero-cta">
          <Link to="/app" className="btn glass-btn lg">Browse boarding houses</Link>
        </div>
      </section>

      <section className="section">
        <div className="grid">
          {features.map(([n, t, d], i) => (
            <motion.div className="glass card" key={t} {...rise(i)}>
              <span className="num">{n}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">How it <em>works</em></h2>
        <ol className="steps">
          {steps.map((s, i) => (
            <motion.li className="glass" key={s} {...rise(i)}>
              <b>{i + 1}</b>
              {s}
            </motion.li>
          ))}
        </ol>
      </section>
    </>
  );
}
