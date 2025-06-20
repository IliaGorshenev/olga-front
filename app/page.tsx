import Image from 'next/image';
import Link from 'next/link';
import ThemeToggle from './components/ThemeToggle';

// Define types for the API response
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

// This function gets called at build time and also on revalidation
async function getFeaturedServices() {
  try {
    const response = await fetch('https://admin.spb-cosmetologist.ru//api/uslugas?populate=*', {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      return { services: [], error: 'Не удалось загрузить услуги' };
    }

    const data: ApiResponse = await response.json();

    // Transform the data to match our Service type
    const services = data.data.map((item) => {
      const serviceData = item.attributes || item;
      return {
        id: item.id,
        title: serviceData.title || 'Без названия',
        description: serviceData.description || '',
        slug: serviceData.slug || `service-${item.id}`,
        image: serviceData.image || [],
      };
    });

    // Limit to 3 services for the featured section
    return { services: services.slice(0, 3), error: null };
  } catch (error) {
    console.error('Error fetching services:', error);
    return { services: [], error: 'Произошла ошибка при загрузке услуг' };
  }
}

export default async function Home() {
  const { services, error } = await getFeaturedServices();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Косметолог Ольга</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />

              <nav>
                <ul className="flex space-x-6">
                  <li>
                    <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
                      Главная
                    </Link>
                  </li>
                  <li>
                    <Link href="/services" className="text-gray-700 dark-theme:text-gray-300 hover:text-blue-500 dark-theme:hover:text-blue-400">
                      Услуги
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="text-gray-700 dark-theme:text-gray-300 hover:text-blue-500 dark-theme:hover:text-blue-400">
                      О нас
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-gray-700 dark-theme:text-gray-300 hover:text-blue-500 dark-theme:hover:text-blue-400">
                      Контакты
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="bg-blue-500 dark-theme:bg-blue-700 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h2 className="text-3xl font-bold mb-4">Профессиональная косметология для вашей красоты</h2>
                <p className="text-lg mb-6">Мы предлагаем широкий спектр косметологических услуг, чтобы помочь вам выглядеть и чувствовать себя лучше.</p>
                <Link
                  href="/services"
                  className="inline-block bg-white dark-theme:bg-gray-800 text-blue-500 dark-theme:text-blue-400 font-medium py-3 px-6 rounded-lg hover:bg-gray-100 dark-theme:hover:bg-gray-700 transition-colors duration-300">
                  Посмотреть услуги
                </Link>
              </div>
              <div className="md:w-1/2">
                <div className="relative h-64 md:h-80 w-full rounded-lg overflow-hidden shadow-lg">
                  <Image src="/images/hero-image.jpg" alt="Косметологические услуги" fill className="object-cover" unoptimized={true} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Services Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-800 dark-theme:text-white mb-8 text-center">Популярные услуги</h2>

            {error ? (
              <div className="bg-red-100 dark-theme:bg-red-900/50 border border-red-400 dark-theme:border-red-700 text-red-700 dark-theme:text-red-300 px-4 py-3 rounded">
                <p>{error}</p>
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 dark-theme:text-gray-400">Услуги не найдены</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {services.map((service) => (
                  <div key={service.id} className="bg-white dark-theme:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    {service.image && service.image.length > 0 && (
                      <div className="relative h-48 w-full">
                        <Image
                          src={`https://admin.spb-cosmetologist.ru/${service.image[0].formats?.medium?.url || service.image[0].url}`}
                          alt={service.title}
                          fill
                          className="object-cover"
                          unoptimized={true}
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 dark-theme:text-white mb-2">{service.title}</h3>
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
            )}

            <div className="text-center mt-10">
              <Link
                href="/services"
                className="inline-block bg-blue-500 hover:bg-blue-600 dark-theme:bg-blue-600 dark-theme:hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-300">
                Все услуги
              </Link>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-16 bg-gray-100 dark-theme:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <div className="relative h-64 md:h-full w-full rounded-lg overflow-hidden shadow-lg">
                  <Image src="/images/about-image.jpg" alt="О нас" fill className="object-cover" unoptimized={true} />
                </div>
              </div>
              <div className="md:w-1/2 md:pl-8">
                <h2 className="text-2xl font-bold text-gray-800 dark-theme:text-white mb-4">О нас</h2>
                <p className="text-gray-600 dark-theme:text-gray-300 mb-4">
                  Мы команда профессиональных косметологов с многолетним опытом работы. Наша цель — помочь вам достичь желаемых результатов и подчеркнуть вашу
                  естественную красоту.
                </p>
                <p className="text-gray-600 dark-theme:text-gray-300 mb-6">
                  Мы используем только проверенные методики и качественные материалы, чтобы обеспечить безопасность и эффективность всех процедур.
                </p>
                <Link
                  href="/about"
                  className="inline-block bg-blue-500 hover:bg-blue-600 dark-theme:bg-blue-600 dark-theme:hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors duration-300">
                  Узнать больше
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-800 dark-theme:text-white mb-8 text-center">Отзывы клиентов</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark-theme:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 dark-theme:bg-gray-700 mr-4"></div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark-theme:text-white">Анна К.</h3>
                    <p className="text-gray-500 dark-theme:text-gray-400 text-sm">Клиент</p>
                  </div>
                </div>
                <p className="text-gray-600 dark-theme:text-gray-300">
                  "Очень довольна результатом процедур. Профессиональный подход и внимание к деталям. Обязательно вернусь снова!"
                </p>
              </div>

              <div className="bg-white dark-theme:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 dark-theme:bg-gray-700 mr-4"></div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark-theme:text-white">Мария Д.</h3>
                    <p className="text-gray-500 dark-theme:text-gray-400 text-sm">Клиент</p>
                  </div>
                </div>
                <p className="text-gray-600 dark-theme:text-gray-300">
                  "Хожу на процедуры уже больше года. Результат всегда превосходит ожидания. Рекомендую всем своим друзьям!"
                </p>
              </div>

              <div className="bg-white dark-theme:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 dark-theme:bg-gray-700 mr-4"></div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark-theme:text-white">Елена В.</h3>
                    <p className="text-gray-500 dark-theme:text-gray-400 text-sm">Клиент</p>
                  </div>
                </div>
                <p className="text-gray-600 dark-theme:text-gray-300">
                  "Отличный сервис и приятная атмосфера. Специалисты всегда дают полезные рекомендации по уходу за кожей."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-gray-100 dark-theme:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="max-w-none mx-auto bg-white dark-theme:bg-gray-700 rounded-lg shadow-md p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-800 dark-theme:text-white mb-6 text-center">Свяжитесь с нами</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark-theme:text-white mb-4">Контактная информация</h3>
                  <div className="mb-4">
                    <p className="text-gray-600 dark-theme:text-gray-300 mb-2">
                      <span className="font-medium">Адрес:</span> г. Москва, ул. Примерная, д. 123
                    </p>
                    <p className="text-gray-600 dark-theme:text-gray-300 mb-2">
                      <span className="font-medium">Телефон:</span> +7 (XXX) XXX-XX-XX
                    </p>
                    <p className="text-gray-600 dark-theme:text-gray-300 mb-2">
                      <span className="font-medium">Email:</span> example@example.com
                    </p>
                    <p className="text-gray-600 dark-theme:text-gray-300">
                      <span className="font-medium">Часы работы:</span> Пн-Пт: 9:00 - 20:00, Сб: 10:00 - 18:00
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark-theme:text-white mb-4">Напишите нам</h3>
                  <form>
                    <div className="mb-4">
                      <label htmlFor="name" className="block text-gray-700 dark-theme:text-gray-300 mb-2">
                        Имя
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="w-full px-4 py-2 border dark-theme:border-gray-600 rounded-lg bg-white dark-theme:bg-gray-800 text-gray-700 dark-theme:text-gray-300"
                        placeholder="Ваше имя"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="email" className="block text-gray-700 dark-theme:text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="w-full px-4 py-2 border dark-theme:border-gray-600 rounded-lg bg-white dark-theme:bg-gray-800 text-gray-700 dark-theme:text-gray-300"
                        placeholder="Ваш email"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="message" className="block text-gray-700 dark-theme:text-gray-300 mb-2">
                        Сообщение
                      </label>
                      <textarea
                        id="message"
                        rows={4}
                        className="w-full px-4 py-2 border dark-theme:border-gray-600 rounded-lg bg-white dark-theme:bg-gray-800 text-gray-700 dark-theme:text-gray-300"
                        placeholder="Ваше сообщение"></textarea>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-blue-500 hover:bg-blue-600 dark-theme:bg-blue-600 dark-theme:hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300">
                      Отправить
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 dark-theme:bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold mb-4">Косметолог Ольга</h3>
              <p className="mb-4 text-gray-300 dark-theme:text-gray-400">Профессиональные косметологические услуги для вашей красоты и здоровья.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 dark-theme:text-gray-400 hover:text-white">
                  Facebook
                </a>
                <a href="#" className="text-gray-300 dark-theme:text-gray-400 hover:text-white">
                  Instagram
                </a>
                <a href="#" className="text-gray-300 dark-theme:text-gray-400 hover:text-white">
                  WhatsApp
                </a>
              </div>
            </div>
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold mb-4">Услуги</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-300 dark-theme:text-gray-400 hover:text-white">
                    Чистка лица
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 dark-theme:text-gray-400 hover:text-white">
                    Массаж
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 dark-theme:text-gray-400 hover:text-white">
                    Пилинг
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 dark-theme:text-gray-400 hover:text-white">
                    Инъекционные процедуры
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Контакты</h3>
              <p className="mb-2">г. Москва, ул. Примерная, д. 123</p>
              <p className="mb-2">+7 (XXX) XXX-XX-XX</p>
              <p>example@example.com</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 dark-theme:border-gray-600 text-center">
            <p>© {new Date().getFullYear()} Косметолог Ольга. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
