import {
  TrustBar as TrustBarRoot,
  TrustBarItem,
  TrustBarItems,
  TrustBarLabel,
} from './TrustBar.styles';

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
    <TrustBarRoot>
      <div className="container">
        <TrustBarLabel>Trusted framework for modern compliance</TrustBarLabel>
        <TrustBarItems>
          {trustItems.map((item) => (
            <TrustBarItem as="span" key={item}>{item}</TrustBarItem>
          ))}
        </TrustBarItems>
      </div>
    </TrustBarRoot>
  );
}
