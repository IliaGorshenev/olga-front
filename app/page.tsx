"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

// Define types for the API response
type PriceListItem = {
  id: number;
  name: string;
  description: string;
  unit: string;
  duration: string;
};

type ProcedureDetails = {
  id: number;
  duration_summary: string;
  frequency: string;
  preparations_used: string;
  anesthesia_info: string;
  course_recommendation: string;
  effect_summary: string;
};

type ImageFormat = {
  name: string;
  url: string;
  width: number;
  height: number;
};

type ImageData = {
  id: number;
  formats: {
    thumbnail: ImageFormat;
    small: ImageFormat;
    medium: ImageFormat;
    large: ImageFormat;
  };
  url: string;
};

type RichTextBlock = {
  type: string;
  children: {
    type: string;
    text: string;
    bold?: boolean;
  }[];
};

type Service = {
  id: number;
  title: string;
  description: string;
  slug: string;
  indications: RichTextBlock[] | null;
  effect_description: RichTextBlock[] | null;
  contraindications: RichTextBlock[] | null;
  primechanie: string | null;
  image: ImageData[];
  price_list: PriceListItem[];
  procedure_details: ProcedureDetails | null;
};

type ApiResponse = {
  data: Service[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
};

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("http://91.197.98.34:8000/api/uslugas?populate=*");
        if (!response.ok) {
          throw new Error("Failed to fetch services");
        }
        const data: ApiResponse = await response.json();
        setServices(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Helper function to render rich text content
  const renderRichText = (content: RichTextBlock[] | null) => {
    if (!content) return null;
    
    return content.map((block, index) => {
      if (block.type === "paragraph") {
        return (
          <p key={index} className="mb-2">
            {block.children.map((child, childIndex) => {
              if (child.bold) {
                return <strong key={childIndex}>{child.text}</strong>;
              }
              return <span key={childIndex}>{child.text}</span>;
            })}
          </p>
        );
      }
      return null;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-800">Услуги косметолога</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {service.image && service.image.length > 0 && (
                  <div className="relative h-64 w-full">
                    <Image
                      src={`http://91.197.98.34:8000${service.image[0].formats?.medium?.url || service.image[0].url}`}
                      alt={service.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{service.title}</h2>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  
                  {service.price_list && service.price_list.length > 0 && service.price_list[0].name && (
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Цены</h3>
                      <ul className="space-y-2">
                        {service.price_list.map((price) => (
                          <li key={price.id} className="flex justify-between">
                            <span>{price.name}</span>
                            {price.unit && <span className="font-medium">{price.unit}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {service.procedure_details && (
                    <div className="text-sm text-gray-500 mt-2">
                      <p>Длительность: {service.procedure_details.duration_summary}</p>
                      <p>Частота: {service.procedure_details.frequency}</p>
                    </div>
                  )}
                  
                  <button className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors duration-300">
                    Подробнее
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
