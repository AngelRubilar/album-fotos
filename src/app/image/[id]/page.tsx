import Link from "next/link";
import Image from "next/image";

interface ImagePageProps {
  params: Promise<{
    id: string;
  }>;
}

// Datos de ejemplo para la imagen
const imageData = {
  id: "1",
  url: "/placeholder-1.jpg",
  title: "Foto de Ejemplo",
  description: "Esta es una descripción detallada de la imagen que muestra información importante sobre el momento capturado.",
  width: 1920,
  height: 1080,
  fileSize: 2048576,
  mimeType: "image/jpeg",
  takenAt: "2024-01-15T10:30:00Z",
  uploadedAt: "2024-01-15T11:00:00Z",
  tags: ["vacaciones", "familia", "playa"],
  customMetadata: {
    camera: "Canon EOS R5",
    lens: "RF 24-70mm f/2.8L IS USM",
    aperture: "f/2.8",
    shutterSpeed: "1/250s",
    iso: 400,
    location: "Playa del Carmen, México"
  }
};

export default async function ImagePage({ params }: ImagePageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/album/2024" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver al Álbum
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">
                {imageData.title}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Editar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-8 text-sm font-medium text-gray-500">
          <ol className="list-none p-0 inline-flex">
            <li className="flex items-center">
              <Link href="/" className="text-blue-600 hover:underline">
                Álbumes
              </Link>
              <svg className="fill-current w-3 h-3 mx-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.488 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"/>
              </svg>
            </li>
            <li className="flex items-center">
              <Link href="/album/2024" className="text-blue-600 hover:underline">
                2024
              </Link>
              <svg className="fill-current w-3 h-3 mx-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.488 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"/>
              </svg>
            </li>
            <li>
              <span>{imageData.title}</span>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Imagen Principal */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="relative">
                <Image
                  src={imageData.url}
                  alt={imageData.title}
                  width={imageData.width}
                  height={imageData.height}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>

          {/* Panel de Información */}
          <div className="space-y-6">
            {/* Información Básica */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Información de la Imagen
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Título</label>
                  <p className="text-gray-900">{imageData.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Descripción</label>
                  <p className="text-gray-900">{imageData.description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha de Captura</label>
                  <p className="text-gray-900">
                    {new Date(imageData.takenAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Subida</label>
                  <p className="text-gray-900">
                    {new Date(imageData.uploadedAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {imageData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Metadatos Técnicos */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Metadatos Técnicos</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Resolución</label>
                    <p className="text-gray-900">{imageData.width} × {imageData.height}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tamaño</label>
                    <p className="text-gray-900">{(imageData.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Formato</label>
                    <p className="text-gray-900">{imageData.mimeType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Cámara</label>
                    <p className="text-gray-900">{imageData.customMetadata.camera}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Objetivo</label>
                    <p className="text-gray-900">{imageData.customMetadata.lens}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Apertura</label>
                    <p className="text-gray-900">{imageData.customMetadata.aperture}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Velocidad</label>
                    <p className="text-gray-900">{imageData.customMetadata.shutterSpeed}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">ISO</label>
                    <p className="text-gray-900">{imageData.customMetadata.iso}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Ubicación</label>
                  <p className="text-gray-900">{imageData.customMetadata.location}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-600 mb-2">
              © 2024 Álbum de Fotos - Creado con Next.js y Tailwind CSS
            </p>
            <p className="text-xs text-gray-500">
              Organiza tus recuerdos de manera inteligente
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
