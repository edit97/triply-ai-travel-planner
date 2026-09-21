import italyImage from '../assets/italian-coast.jpg'
import japanImage from '../assets/japan.jpg'
import baliImage from '../assets/bali.jpg'

const destinations = [
  { name: 'Italy', cities: 'Rome, Florence & Venice', description: 'Mediterranean escape', image: italyImage, alt: 'Colorful seaside buildings in Cinque Terre, Italy' },
  { name: 'Japan', cities: 'Tokyo, Kyoto & Osaka', description: 'Culture meets the future', image: japanImage, alt: 'Traditional Japanese pagoda overlooking Kyoto at sunset' },
  { name: 'Bali', cities: 'Ubud, Uluwatu & Canggu', description: 'Tropical adventure', image: baliImage, alt: 'Balinese temple beside a lake with mountains in the background' },
]

type DestinationCardProps = { destination: (typeof destinations)[number] }

function DestinationCard({ destination }: DestinationCardProps) {
  return (
    <article className="destination-card">
      <div className="destination-card-image">
        <img src={destination.image} alt={destination.alt} loading="lazy" decoding="async" width="1000" height="750" />
        <span className="destination-tag">{destination.description}</span>
      </div>
      <div className="destination-card-copy">
        <h3>{destination.name}</h3>
        <p>{destination.cities}</p>
      </div>
    </article>
  )
}

export default function Destinations() {
  return (
    <section id="destinations" className="destinations landing-section page-width" aria-labelledby="destinations-heading" tabIndex={-1}>
      <div className="section-intro">
        <span className="eyebrow">Popular destinations</span>
        <h2 id="destinations-heading">Where will you go next?</h2>
        <p>From timeless cities to tropical hideaways, discover a few favorite places to inspire your next adventure.</p>
      </div>
      <div className="destination-grid">
        {destinations.map(destination => <DestinationCard key={destination.name} destination={destination} />)}
      </div>
    </section>
  )
}
