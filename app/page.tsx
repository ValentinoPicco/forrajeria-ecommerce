/* eslint-disable @next/next/no-html-link-for-pages */
import {
  LayoutGrid,
  List,
  Heart,
  ChevronLeft,
  ChevronRight,
  Tractor,
  ShoppingCart
} from 'lucide-react';
import Header from "./components/Header";

const products = [
  {
    id: 1,
    category: 'Semillas',
    title: 'Mix Forrajero Premium',
    description: 'Optimizado para climas templados con alta densidad de nutrientes.',
    price: '$12.450',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxGMM2tEbGkUeSneJy3vJtLvBeNRb-HP3uvJym0O63O4wGIPlRoo1N1jo2qOKc9Wxi8VPYvUcAsqiI43s-5gYdOCZnhxHSnmR2YFcDbk6WMEYQv71jNI6i4PayShBC47-ELSf1h8uOYGRh_pInJX9YDVmEzZIHvP0v2mYbJ_FJJn4LnnlvZOod1xUqcu36WmC-3TeR2vSuu-LfZrYqa-_LtJ1g2tQs2WTEq92XJ4cUVqhSElyMdvdy8-WT8NjB32eG_SXpO97BS_4a'
  },
  {
    id: 2,
    category: 'Herramientas',
    title: 'Pala de Forja Manual',
    description: 'Acero templado con mango ergonómico de fresno.',
    price: '$8.900',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtjFobyz-vEkTzeUXWDuhcH8ib8s_EYKyNZll_g3dcI7iwcPRN24T3ctVtk76MWJiFkbHsQkIhvIFzo2jciKEG03xdQEJ-E2Ke7Mc81_1okiRlsNpua9BTw0Gbg17wE_O0RIa6p-j_bqjMe_uh_d-Al9IOJNtTSnY7R9tnITQTxZwx_qKMQ6Cqzm_y8I0lCUBudbBCZNsXjB5IpG171zx4AlklsUwtcp2mykjq1C99KcM2syP5cwOgKQfe-VG5bocOLvzd8kh_cOSL'
  },
  {
    id: 3,
    category: 'Nutrición',
    title: 'Fertilizante NPK 15-15-15',
    description: 'Liberación controlada para un crecimiento radicular profundo.',
    price: '$15.200',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJVrqW-gXdD-Yyc5OPHBH93nyMAvuoyFUa0_DrvslsMYmhe1MthN80u0JE6kHxEYtXMhNBskGtFejU0rbAWFCDhAB6fnmvlOIkjLMjL8Gr7DgYjWlR60qJZkBTQuKmoV_8kC-IAiBpe6_XeTpDhaRWYf4kyT0FlMUkA4ehseHavSrownnmx6a35JcqEXIB7iY-gQD8k02-newe7YcoioKUrFqrXhydK5utWlK2uYdbU1hm-lxjzjf-REWoYiMwdp_Ewu1lmWQCKPP8'
  },
  {
    id: 4,
    category: 'Granos',
    title: 'Maíz Quebrado Superior',
    description: 'Grano seleccionado de alta digestibilidad para ganado.',
    price: '$6.750',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCy7L-WzkF1IApOc6nvgLvkWKnsIzZ4frO7IEcYvesomvBrot7DLOsFkOvydu8WfNaJuVn1axROYaWUxVavlUitItc61vIim8kxXyF4iH1xu5UMkWmLSml3b9_hoHpqPlLEx6u_HjcL1PhXIMvGjAJIOEw_0HfgyHr5NPJdjLiO8BQe8Uk4iFkHb5Lam3PiNWtxjOqoE9-79oPb-83A7LdVXwOKtb5rSoHVuHPNmOY-VZpEjmplDqAJ_ukFr2OkcAOvmG4A_A-0JeHI'
  },
  {
    id: 5,
    category: 'Sistemas',
    title: 'Kit Riego Goteo Smart',
    description: 'Instalación modular para optimización del recurso hídrico.',
    price: '$32.000',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3oCXcXAdDyTVLSAFZd2qrmrw1vO4KnWRZA2umdaBgXb4XxDunMAedAKMWT-VUp3mClyp2H7LrfnVJkYYDWolhhzIg6hb0A_FBsIdX3niZ8CfvZZmNvc0TdpQjAO7SOguf5uF9Nf9g9PAH1AIUdH7HtUo7ZDhD8tEC9QhheWWvEheQv9_Avwppjqy--HlXI3GtWdqJx9WtkXtOpCQHVWW9JTYorxVQQlYFdB1IDNnFO2sq2kzR9TPtw-e3ZwJG6_VTo6xk4la7x1Ga'
  }
];

export default async function Home() {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-sans">
      <Header />

      <main className="grow">
        {/* Catalog Section */}
        <section className="max-w-7xl mx-auto px-8 py-12 md:py-16">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Filter Sidebar */}
            <aside className="w-full lg:w-64 shrink-0">
              <div className="sticky top-28 space-y-10">
                <div>
                  <h3 className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-6">Categorías</h3>
                  <ul className="space-y-4">
                    <li>
                      <button className="flex items-center gap-3 text-primary font-semibold group cursor-pointer">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full group-hover:scale-150 transition-transform"></span>
                        Ver Todo
                      </button>
                    </li>
                    <li>
                      <button className="flex items-center gap-3 text-on-surface-variant hover:text-primary transition-colors group cursor-pointer">
                        <span className="w-1.5 h-1.5 bg-outline-variant rounded-full group-hover:bg-primary transition-colors"></span>
                        Semillas Forrajeras
                      </button>
                    </li>
                    <li>
                      <button className="flex items-center gap-3 text-on-surface-variant hover:text-primary transition-colors group cursor-pointer">
                        <span className="w-1.5 h-1.5 bg-outline-variant rounded-full group-hover:bg-primary transition-colors"></span>
                        Nutrición de Cultivos
                      </button>
                    </li>
                    <li>
                      <button className="flex items-center gap-3 text-on-surface-variant hover:text-primary transition-colors group cursor-pointer">
                        <span className="w-1.5 h-1.5 bg-outline-variant rounded-full group-hover:bg-primary transition-colors"></span>
                        Herramientas Manuales
                      </button>
                    </li>
                    <li>
                      <button className="flex items-center gap-3 text-on-surface-variant hover:text-primary transition-colors group cursor-pointer">
                        <span className="w-1.5 h-1.5 bg-outline-variant rounded-full group-hover:bg-primary transition-colors"></span>
                        Sistemas de Riego
                      </button>
                    </li>
                  </ul>
                </div>

                <div className="pt-6 border-t border-outline-variant/20">
                  <h3 className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-6">Rango de Precio</h3>
                  <div className="space-y-4">
                    <input className="w-full accent-primary h-1 bg-surface-container-highest rounded-lg appearance-none cursor-pointer" type="range" />
                    <div className="flex justify-between text-xs font-bold text-on-surface-variant">
                      <span>$0</span>
                      <span>$50.000+</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-4">Disponibilidad</h3>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input className="rounded border-outline-variant text-primary focus:ring-primary w-5 h-5 cursor-pointer" type="checkbox" />
                    <span className="text-on-surface-variant group-hover:text-on-surface transition-colors">En Stock</span>
                  </label>
                </div>
              </div>
            </aside>

            {/* Product Grid */}
            <div className="grow">
              <div className="flex justify-between items-end mb-10">
                <div>
                  <p className="text-sm font-medium text-on-surface-variant mb-1">Mostrando 24 productos</p>
                  <h2 className="text-3xl font-bold text-primary tracking-tight">Catálogo de Temporada</h2>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg bg-surface-container-low text-primary cursor-pointer">
                    <LayoutGrid className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg text-outline-variant cursor-pointer">
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {products.map((product) => (
                  <div key={product.id} className="group relative bg-surface-container-low rounded-2xl overflow-hidden hover:bg-surface-container-lowest transition-all duration-500 hover:-translate-y-1">
                    <div className="aspect-square overflow-hidden bg-surface-container relative">
                      <img
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 absolute inset-0"
                        alt={product.title}
                        src={product.img}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <span className="px-2 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-widest rounded-full">
                          {product.category}
                        </span>
                        <Heart className="w-5 h-5 text-outline hover:text-primary cursor-pointer transition-colors" />
                      </div>
                      <h3 className="text-xl font-bold text-on-surface mb-2 group-hover:text-primary transition-colors cursor-pointer">
                        {product.title}
                      </h3>
                      <p className="text-on-surface-variant text-sm mb-6 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-black text-primary">{product.price}</span>
                        <button className="p-3 bg-primary text-on-primary rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors cursor-pointer">
                          <ShoppingCart className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Special CTA Card (Asymmetric Bento Element) */}
                <div className="relative bg-tertiary rounded-2xl overflow-hidden p-6 flex flex-col justify-between group h-fit self-start">
                  <div className="z-10">
                    <h3 className="text-2xl font-bold text-white mb-2 leading-tight">¿Tienes dudas?</h3>
                    <p className="text-white/80 text-sm mb-6">Nuestro personal puede ayudarte</p>
                    <button className="px-6 py-3 bg-white text-tertiary rounded-xl font-bold text-sm tracking-tight hover:bg-white/90 transition-colors relative z-20 cursor-pointer">
                      Contactanos
                    </button>
                  </div>
                </div>
              </div>

              {/* Pagination */}
              <div className="mt-16 flex justify-center gap-2">
                <button className="w-10 h-10 rounded-lg flex items-center justify-center bg-surface-container-high text-primary cursor-pointer hover:bg-surface-container">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary text-on-primary font-bold cursor-pointer">1</button>
                <button className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-surface-container-high text-on-surface transition-colors cursor-pointer">2</button>
                <button className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-surface-container-high text-on-surface transition-colors cursor-pointer">3</button>
                <button className="w-10 h-10 rounded-lg flex items-center justify-center bg-surface-container-high text-primary cursor-pointer hover:bg-surface-container">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full mt-auto bg-[#f2f4d8] dark:bg-stone-900 border-t border-primary-container/10 transition-colors duration-300">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 py-12 w-full max-w-7xl mx-auto">
          <div className="mb-8 md:mb-0">
            {/* Logo o marca iría aquí */}
            <div className="text-sm tracking-normal text-primary-container dark:text-stone-400">© {new Date().getFullYear()}. Todos los derechos reservados.</div>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <a className="text-sm tracking-normal text-primary-container dark:text-stone-400 opacity-80 hover:text-primary dark:hover:text-[#f9fbea] transition-colors" href="#">Facebook</a>
            <a className="text-sm tracking-normal text-primary-container dark:text-stone-400 opacity-80 hover:text-primary dark:hover:text-[#f9fbea] transition-colors" href="#">Instagram</a>
            <a className="text-sm tracking-normal text-primary-container dark:text-stone-400 opacity-80 hover:text-primary dark:hover:text-[#f9fbea] transition-colors" href="#">WhatsApp</a>
            <a className="text-sm tracking-normal text-primary-container dark:text-stone-400 opacity-80 hover:text-primary dark:hover:text-[#f9fbea] transition-colors" href="#">Términos y Condiciones</a>
          </div>
        </div>
      </footer>
    </div>
  );
}