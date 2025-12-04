import { Star } from "lucide-react";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Jean Dupont",
      role: "Entrepreneur",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jean",
      content: "Excellent service! J'ai trouvé le véhicule parfait rapidement.",
      rating: 5,
    },
    {
      name: "Marie Martin",
      role: "Médecin",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marie",
      content: "L'équipe est très professionnelle et attentive aux détails.",
      rating: 5,
    },
    {
      name: "Pierre Bernard",
      role: "Ingénieur",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pierre",
      content: "Vraiment satisfait de mon achat. Je recommande vivement!",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center text-kia_dark mb-12">
          Ce que disent nos clients
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <div
              key={i}
              className="bg-gray-50 p-6 rounded-lg shadow-lg hover:shadow-xl transition"
            >
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h3 className="font-bold text-kia_dark">{testimonial.name}</h3>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>

              <div className="flex mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              <p className="text-gray-700">"{testimonial.content}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}