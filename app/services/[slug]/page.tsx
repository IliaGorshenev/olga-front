import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Define types for the API response
interface ApiResponse {
  data: Service[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

interface Service {
  id: number;
  documentId: string;
  title: string;
  description: string;
  slug: string;
  image: Array<{
    id: number;
    url: string;
    formats?: {
      thumbnail?: { url: string };
      small?: { url: string };
      medium?: { url: string };
      large?: { url: string };
    };
  }>;
  price_list: Array<{
    id: number;
    name: string;
    description: string;
    unit: string;
    duration: string;
  }>;
  procedure_details: {
    id: number;
    duration_summary: string;
    frequency: string;
    preparations_used: string;
    anesthesia_info: string;
    course_recommendation: string;
    effect_summary: string;
  };
  indications: any;
  effect_description: any;
  contraindications: any;
  primechanie: string;
}

// Helper function to render rich text content
function renderRichText(content: any) {
  if (!content || !Array.isArray(content)) {
    return null;
  }

  return (
    <div>
      {content.map((block, blockIndex) => {
        if (block.type === 'paragraph') {
          return (
            <p key={blockIndex} className="mb-2">
              {block.children.map((child: any, childIndex: number) => {
                const text = child.text;
                if (child.bold) {
                  return <strong key={childIndex}>{text}</strong>;
                }
                if (child.italic) {
                  return <em key={childIndex}>{text}</em>;
                }
                return <span key={childIndex}>{text}</span>;
              })}
            </p>
          );
        }
        return null;
      })}
    </div>
  );
}

// Fetch service data by slug
async function getServiceBySlug(slug: string) {
  try {
    const response = await fetch(`https://startrixbot.ru/api/uslugas?filters[slug][$eq]=${slug}&populate=*`, {
      next: { revalidate: 3600 }, // Revalidate every hour (ISR)
    });

    if (!response.ok) {
      throw new Error('Failed to fetch service');
    }

    const data: ApiResponse = await response.json();

    if (data.data.length === 0) {
      return null;
    }

    return data.data[0];
  } catch (error) {
    console.error('Error fetching service:', error);
    return null;
  }
}

// Generate static paths for all services
export async function generateStaticParams() {
  try {
    const response = await fetch('https://startrixbot.ru/api/uslugas?fields=slug', {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      return [];
    }

    const data: ApiResponse = await response.json();
    return data.data.map((service) => ({
      slug: service.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function ServicePage({ params }: { params: { slug: string } }) {
  // Use the slug directly without destructuring to avoid the Next.js warning
  const service = await getServiceBySlug(params.slug);

  if (!service) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center">
            <Link href="/services" className="text-blue-500 hover:text-blue-700 mr-4">
              ← Назад к услугам
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">{service.title}</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="md:flex">
            {/* Image Section */}
            {service.image && service.image.length > 0 && (
              <div className="md:w-1/3 relative">
                <div className="relative h-80 md:h-full w-full">
                  <Image
                    src={`https://startrixbot.ru${service.image[0].formats?.large?.url || service.image[0].url}`}
                    alt={service.title}
                    fill
                    className="object-cover"
                    unoptimized={true}
                  />
                </div>
              </div>
            )}

            {/* Content Section */}
            <div className="md:w-2/3 p-6 md:p-8">
              <div className="prose max-w-none">
                <p className="text-lg text-gray-700 mb-6">{service.description}</p>

                {/* Procedure Details */}
                {service.procedure_details && (
                  <div className="mb-8 bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Информация о процедуре</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {service.procedure_details.duration_summary && (
                        <div>
                          <h3 className="font-semibold text-gray-700">Длительность:</h3>
                          <p>{service.procedure_details.duration_summary}</p>
                        </div>
                      )}
                      {service.procedure_details.frequency && (
                        <div>
                          <h3 className="font-semibold text-gray-700">Частота:</h3>
                          <p>{service.procedure_details.frequency}</p>
                        </div>
                      )}
                      {service.procedure_details.preparations_used && (
                        <div>
                          <h3 className="font-semibold text-gray-700">Используемые препараты:</h3>
                          <p>{service.procedure_details.preparations_used}</p>
                        </div>
                      )}
                      {service.procedure_details.anesthesia_info && (
                        <div>
                          <h3 className="font-semibold text-gray-700">Анестезия:</h3>
                          <p>{service.procedure_details.anesthesia_info}</p>
                        </div>
                      )}
                      {service.procedure_details.course_recommendation && (
                        <div>
                          <h3 className="font-semibold text-gray-700">Рекомендации по курсу:</h3>
                          <p>{service.procedure_details.course_recommendation}</p>
                        </div>
                      )}
                      {service.procedure_details.effect_summary && (
                        <div>
                          <h3 className="font-semibold text-gray-700">Эффект:</h3>
                          <p>{service.procedure_details.effect_summary}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Indications */}
                {service.indications && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Показания</h2>
                    <div className="pl-4">{renderRichText(service.indications)}</div>
                  </div>
                )}

                {/* Effect Description */}
                {service.effect_description && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Эффект от процедуры</h2>
                    <div>{renderRichText(service.effect_description)}</div>
                  </div>
                )}

                {/* Contraindications */}
                {service.contraindications && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Противопоказания</h2>
                    <div className="pl-4">{renderRichText(service.contraindications)}</div>
                  </div>
                )}

                {/* Price List */}
                {service.price_list && service.price_list.length > 0 && service.price_list[0].name && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Цены</h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                          <tr>
                            <th className="py-2 px-4 border-b text-left">Название</th>
                            <th className="py-2 px-4 border-b text-left">Описание</th>
                            <th className="py-2 px-4 border-b text-left">Единица</th>
                            <th className="py-2 px-4 border-b text-left">Длительность</th>
                          </tr>
                        </thead>
                        <tbody>
                          {service.price_list.map((price) => (
                            <tr key={price.id} className="hover:bg-gray-50">
                              <td className="py-2 px-4 border-b">{price.name || '-'}</td>
                              <td className="py-2 px-4 border-b">{price.description || '-'}</td>
                              <td className="py-2 px-4 border-b">{price.unit || '-'}</td>
                              <td className="py-2 px-4 border-b">{price.duration || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Note */}
                {service.primechanie && (
                  <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400">
                    <h3 className="font-bold text-gray-800 mb-2">Примечание</h3>
                    <p>{service.primechanie}</p>
                  </div>
                )}
              </div>

              {/* Call to Action */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <a
                  href="tel:+7XXXXXXXXXX"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg text-center transition-colors duration-300">
                  Записаться на процедуру
                </a>
                <Link
                  href="/services"
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg text-center transition-colors duration-300">
                  Вернуться к списку услуг
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-8 mt-12">
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
          <div className="mt-8 pt-8 border-t border-gray-700 text-center">
            <p>© {new Date().getFullYear()} Все права защищены</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
