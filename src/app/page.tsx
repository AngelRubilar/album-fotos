import Link from "next/link";

// Datos de ejemplo para los álbumes
const albums = [
  { year: 2024, title: "Año 2024", imageCount: 150 },
  { year: 2023, title: "Año 2023", imageCount: 89 },
  { year: 2022, title: "Año 2022", imageCount: 234 },
  { year: 2021, title: "Año 2021", imageCount: 167 },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-gray-900">
            📸 Álbum de Fotos
          </h1>
          <p className="text-lg max-w-2xl mx-auto mb-8 text-gray-600">
            Explora tus recuerdos organizados por años. Cada imagen cuenta una historia única.
          </p>
          
          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/upload">
              <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all duration-300">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Subir Nuevas Fotos
              </button>
            </Link>
            
            <Link href="/admin">
              <button className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-700 transition-all duration-300">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Administrar Álbumes
              </button>
            </Link>
          </div>
        </header>

        {/* Grid de Álbumes */}
        <main className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {albums.map((album, index) => {
              // Gradientes diferentes para cada álbum
              const gradients = [
                "from-emerald-400 via-teal-500 to-cyan-600",
                "from-violet-400 via-purple-500 to-fuchsia-600", 
                "from-rose-400 via-pink-500 to-red-600",
                "from-amber-400 via-orange-500 to-yellow-600"
              ];
              const gradient = gradients[index % gradients.length];
              
              return (
                <Link
                  key={album.year}
                  href={`/album/${album.year}`}
                  className="group block"
                >
                  <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:rotate-1 overflow-hidden border border-gray-100">
                    {/* Imagen de Portada con diseño moderno */}
                    <div className={`aspect-[4/3] bg-gradient-to-br ${gradient} relative overflow-hidden`}>
                      {/* Patrón de fondo */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                          backgroundSize: '60px 60px'
                        }}></div>
                      </div>
                      
                      {/* Año grande con efecto glassmorphism */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="backdrop-blur-sm bg-white/20 rounded-3xl px-8 py-6 border border-white/30">
                          <span className="text-7xl font-bold text-white drop-shadow-lg">
                            {album.year}
                          </span>
                        </div>
                      </div>
                      
                      {/* Efecto de overlay al hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Indicador de fotos en la esquina */}
                      <div className="absolute top-4 right-4 backdrop-blur-sm bg-white/20 rounded-full px-3 py-1 border border-white/30">
                        <span className="text-white text-sm font-medium">
                          {album.imageCount} 📸
                        </span>
                      </div>
                    </div>

                    {/* Información del Álbum con nuevo diseño */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-2xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors duration-300">
                          {album.title}
                        </h2>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      </div>
                      
                      <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                        Colección de {album.imageCount} momentos especiales capturados durante el año {album.year}
                      </p>
                      
                      {/* Barra de progreso visual */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Memorias</span>
                          <span>{Math.round((album.imageCount / 250) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full bg-gradient-to-r ${gradient} transition-all duration-1000`}
                            style={{ width: `${Math.min((album.imageCount / 250) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Botón de Acceso rediseñado */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-600 group-hover:text-gray-800 transition-colors">
                          <svg 
                            className="w-5 h-5 mr-2" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium">Explorar</span>
                        </div>
                        <svg 
                          className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transform group-hover:translate-x-1 transition-all duration-300" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center mt-16">
          <p className="text-gray-500">
            © 2024 Álbum de Fotos - Creado con Next.js y Tailwind CSS
          </p>
        </footer>
      </div>
    </div>
  );
}
