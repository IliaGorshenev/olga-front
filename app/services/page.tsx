import Image from 'next/image';
import Link from 'next/link';
import Header from '../components/Header';

type ImageFormat = {
  url: string;
};

type ImageData = {
  formats: {
    thumbnail?: ImageFormat;
    small?: ImageFormat;
    medium?: ImageFormat;
    large?: ImageFormat;
  };
  url: string;
};

type Service = {
  id: number;
  title: string;
  description: string;
  slug: string;
  image: ImageData[];
};

type ApiResponse = {
  data: {
    id: number;
    attributes: Service;
  }[];
};

// Function to group services by first letter of title
function groupServicesByFirstLetter(services: Service[]) {
  const grouped: { [key: string]: Service[] } = {};

  services.forEach((service) => {
    // Check if title exists and is not empty
    if (!service.title) {
      // Handle services with no title - put them under '#' or another special character
      const firstLetter = '#';
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(service);
    } else {
      const firstLetter = service.title.charAt(0).toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(service);
    }
  });

  // Sort the keys alphabetically
  return Object.keys(grouped)
    .sort()
    .map((letter) => ({
      letter,
      services: grouped[letter],
    }));
}

async function getAllServices() {
  try {
    const response = await fetch('https://startrixbot.ru/api/uslugas?populate=*', {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      return { services: [], error: 'Не удалось загрузить услуги' };
    }

    const data: ApiResponse = await response.json();

    // Transform the data to match our Service type and ensure all required fields exist
    const services = data.data.map((item) => {
      const serviceData = item.attributes || item;
      return {
        id: item.id,
        title: serviceData.title || 'Без названия', // Provide default title
        description: serviceData.description || '',
        slug: serviceData.slug || `service-${item.id}`,
        image: serviceData.image || [],
      };
    });
    // Optionally filter out services with missing critical data
    // .filter(service => service.title && service.slug)

    return { services, error: null };
  } catch (error) {
    console.error('Error fetching services:', error);
    return { services: [], error: 'Произошла ошибка при загрузке услуг' };
  }
}

export default async function ServicesPage() {
  const { services, error } = await getAllServices();
  const groupedServices = groupServicesByFirstLetter(services);

  return (
    <div className="min-h-screen bg-gray-50 dark-theme:bg-gray-900">
      <Header title="Наши услуги" />

      <main className="container mx-auto px-4 py-8">
        {error ? (
          <div className="bg-red-100 dark-theme:bg-red-900/50 border border-red-400 dark-theme:border-red-700 text-red-700 dark-theme:text-red-300 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 dark-theme:text-gray-400">Услуги не найдены</p>
          </div>
        ) : (
          <>
            {/* Card View */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 dark-theme:text-white mb-6">Все услуги</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service) => (
                  <div key={service.id} className="bg-white dark-theme:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    {service.image && service.image.length > 0 && (
                      <div className="relative h-48 w-full">
                        <Image
                          src={`https://startrixbot.ru${service.image[0].formats?.medium?.url || service.image[0].url}`}
                          alt={service.title}
                          fill
                          className="object-cover"
                          unoptimized={true}
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-gray-800 dark-theme:text-white mb-2">{service.title}</h2>
                      <p className="text-gray-600 dark-theme:text-gray-300 mb-4">{service.description}</p>
                      <Link
                        href={`/services/${service.slug}`}
                        className="inline-block bg-blue-500 hover:bg-blue-600 dark-theme:bg-blue-600 dark-theme:hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors duration-300">
                        Подробнее
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Catalog View */}
            <div className="bg-white dark-theme:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 dark-theme:text-white mb-6">Каталог услуг</h2>

              {groupedServices.map((group) => (
                <div key={group.letter} className="mb-8">
                  <h3 className="text-xl font-bold text-gray-800 dark-theme:text-white mb-4 border-b-2 border-blue-500 pb-2">{group.letter}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.services.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center p-4 border dark-theme:border-gray-700 rounded hover:bg-gray-50 dark-theme:hover:bg-gray-700 transition-colors duration-200">
                        {service.image && service.image.length > 0 && (
                          <div className="relative h-12 w-12 mr-4">
                            <Image
                              src={`https://startrixbot.ru${service.image[0].formats?.thumbnail?.url || service.image[0].url}`}
                              alt={service.title}
                              fill
                              className="object-cover rounded-full"
                              unoptimized={true}
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <Link href={`/services/${service.slug}`} className="block">
                            <h4 className="font-semibold text-gray-800 dark-theme:text-white">{service.title}</h4>
                            <p className="text-sm text-gray-600 dark-theme:text-gray-300">{service.description.substring(0, 60)}...</p>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <footer className="bg-gray-800 dark-theme:bg-gray-900 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold mb-4">Контакты</h3>
              <p className="mb-2">Телефон: +7 (XXX) XXX-XX-XX</p>
              <p>Email: example@example.com</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Адрес</h3>
              <p>г. Москва, ул. Примерная, д. 123</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 dark-theme:border-gray-600 text-center">
            <p>© {new Date().getFullYear()} Все права защищены</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
