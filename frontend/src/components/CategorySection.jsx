import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './CategorySection.css';

export default function CategorySection() {
  const departments = [
    {
      name: 'Women',
      title: "Women's Collection",
      subtext: 'Effortless basics, sharp blazers & refined silhouettes',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80',
      categories: ['Basics', 'Blazer'],
      link: '/shop?dept=Women',
    },
    {
      name: 'Men',
      title: "Men's Collection",
      subtext: 'Merino knitwear, staple denim jeans & leather jackets',
      image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800&auto=format&fit=crop&q=80',
      categories: ['Knitwear', 'Jeans', 'Jackets'],
      link: '/shop?dept=Men',
    },
    {
      name: 'Kids',
      title: "Kids' Collection",
      subtext: 'Playful hoodies, floral dresses & comfortable jackets',
      image: 'https://images.unsplash.com/photo-1503944547408-b6559a442358?w=800&auto=format&fit=crop&q=80',
      categories: ['Girl', 'Boy'],
      link: '/shop?dept=Kids',
    },
  ];

  return (
    <section className="category-section">
      <div className="container">
        <div className="section-header">
          <div>
            <span className="section-eyebrow">Curated Departments</span>
            <h2 className="heading-section">Explore Collections</h2>
          </div>
          <Link to="/shop" className="explore-all-link">
            View All Departments <ArrowRight size={16} />
          </Link>
        </div>

        <div className="category-grid">
          {departments.map((dept) => (
            <div key={dept.name} className="category-card">
              <div className="category-image-wrap">
                <img src={dept.image} alt={dept.title} className="category-img" />
                <div className="category-overlay"></div>
              </div>

              <div className="category-content">
                <span className="category-dept-tag">{dept.name}</span>
                <h3 className="category-title">{dept.title}</h3>
                <p className="category-subtext">{dept.subtext}</p>

                <div className="category-tags">
                  {dept.categories.map((cat) => (
                    <Link
                      key={cat}
                      to={`/shop?dept=${dept.name}&cat=${cat}`}
                      className="category-pill"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>

                <Link to={dept.link} className="category-btn">
                  Explore {dept.name} <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
