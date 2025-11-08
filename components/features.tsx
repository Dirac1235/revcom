import { MessageSquare, Shield, TrendingUp, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Users,
    title: "Connect Directly",
    description: "Buyers and sellers communicate directly through our secure messaging system. No middleman, no hassle.",
  },
  {
    icon: Shield,
    title: "Secure Transactions",
    description: "Built-in trust features including ratings, reviews, and verification systems protect both parties.",
  },
  {
    icon: MessageSquare,
    title: "Real-time Chat",
    description: "Negotiate, ask questions, and finalize deals with instant messaging and notifications.",
  },
  {
    icon: TrendingUp,
    title: "Smart Matching",
    description: "Our platform matches buyer needs with seller offerings, making it easy to find the right fit.",
  },
];

const Features = () => {
  return (
    <section className="py-32 border-t">
      <div className="container px-8 mx-auto">
        <div className="max-w-3xl mb-24">
          <h2 className="text-4xl md:text-6xl font-light tracking-tight mb-6">
            Why RevCom?
          </h2>
          <p className="text-lg text-muted-foreground font-light leading-relaxed">
            Everything you need to buy, sell, and connect
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-16 lg:gap-24">
          {features.map((feature, index) => (
            <div key={index} className="space-y-4 group">
              <div className="h-10 w-10 flex items-center justify-center">
                <feature.icon className="h-6 w-6 text-foreground" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-light tracking-tight">{feature.title}</h3>
              <p className="text-muted-foreground font-light leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
