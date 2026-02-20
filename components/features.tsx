import { MessageSquare, Shield, TrendingUp, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Users,
    title: "Connect Directly",
    description:
      "Buyers and sellers communicate directly through our secure messaging system. No middleman, no hassle.",
  },
  {
    icon: Shield,
    title: "Secure Transactions",
    description:
      "Built-in trust features including ratings, reviews, and verification systems protect both parties.",
  },
  {
    icon: MessageSquare,
    title: "Real-time Chat",
    description:
      "Negotiate, ask questions, and finalize deals with instant messaging and notifications.",
  },
  {
    icon: TrendingUp,
    title: "Smart Matching",
    description:
      "Our platform matches buyer needs with seller offerings, making it easy to find the right fit.",
  },
];

const Features = () => {
  const iconColors = [
    "text-blue-600 dark:text-blue-400",
    "text-indigo-600 dark:text-indigo-400",
    "text-purple-600 dark:text-purple-400",
    "text-cyan-600 dark:text-cyan-400",
  ];

  return (
    <section className="py-32 border-t bg-gradient-to-b from-white via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-blue-950/10 dark:to-indigo-950/10">
      <div className="container px-8 mx-auto">
        <div className="max-w-3xl mb-24">
          <h2 className="text-4xl md:text-6xl font-light tracking-tight mb-6 text-blue-600 dark:text-blue-400">
            Why RevCom?
          </h2>
          <p className="text-lg text-muted-foreground font-light leading-relaxed">
            Everything you need to buy, sell, and connect
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-16 lg:gap-24">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-blue-100 dark:border-blue-900/50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
            >
              <CardContent className="space-y-4 p-6">
                <div
                  className={`h-12 w-12 flex items-center justify-center rounded-lg bg-linear-to-br ${
                    index === 0
                      ? "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30"
                      : index === 1
                        ? "from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/30"
                        : index === 2
                          ? "from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30"
                          : "from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30"
                  }`}
                >
                  <feature.icon
                    className={`h-6 w-6 ${iconColors[index]}`}
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="text-2xl font-light tracking-tight text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground font-light leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
