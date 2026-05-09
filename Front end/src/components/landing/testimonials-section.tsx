import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sara Bekele",
    role: "Patient",
    image: "/images/user-1.jpg",
    quote: "Found my medication in 2 minutes!",
  },
  {
    name: "Dr. Abebe Tadesse",
    role: "Physician",
    image: "/images/user-2.jpg",
    quote: "I recommend PharmaLink to all my patients.",
  },
  {
    name: "Meron Hailu",
    role: "Pharmacist",
    image: "/images/user-3.jpg",
    quote: "Our customer reach doubled in 3 months.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Loved by Thousands
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="p-8 rounded-3xl bg-muted/30 border border-border hover:border-primary/30 transition-colors"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="text-xl font-medium text-foreground mb-8">
                &quot;{testimonial.quote}&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-full overflow-hidden">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-semibold text-foreground">
                    {testimonial.name}
                  </div>
                  <div className="text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
