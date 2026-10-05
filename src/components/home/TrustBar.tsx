import './TrustBar.css';

const trustItems = [
  'ISO 9001 Ready',
  'ISO 14001 Ready',
  'ISO 45001 Ready',
  'ISO 22000 Ready',
  'Cloud-Based',
  'SME Focused',
];

export function TrustBar() {
  return (
    <section className="trust-bar">
      <div className="container">
        <p className="trust-bar-label">Trusted framework for modern compliance</p>
        <div className="trust-bar-items">
          {trustItems.map((item) => (
            <span key={item} className="trust-bar-item">{item}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
