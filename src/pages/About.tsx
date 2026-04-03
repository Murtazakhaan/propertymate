import { Card, CardContent } from "@/components/ui/card";
import { Brain, Database, Shield } from "lucide-react";

const About = () => (
  <div className="container max-w-3xl py-10 md:py-16 space-y-10">
    <div className="text-center space-y-3">
      <h1 className="text-3xl font-bold text-foreground">How Investore Works</h1>
      <p className="text-muted-foreground max-w-xl mx-auto">
        Investore matches your goals and preferences with Australian suburb data, giving you a personalised shortlist in minutes.
      </p>
    </div>

    <div className="grid gap-6">
      {[
        { icon: Brain, title: "Smart Analysis", text: "Your quiz answers are evaluated against suburb data covering growth potential, rental yield, risk level, and affordability." },
        { icon: Database, title: "Real Data", text: "Recommendations draw on publicly available property data including median prices, vacancy rates, population growth, and infrastructure plans." },
        { icon: Shield, title: "Not Financial Advice", text: "Investore provides general guidance only. We are not licensed financial advisors. Always consult a qualified professional before making purchasing decisions." },
      ].map((item) => (
        <Card key={item.title}>
          <CardContent className="flex gap-4 py-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <item.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{item.text}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default About;
