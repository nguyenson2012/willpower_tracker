import { useMemo } from "react";
import { Card } from "@/components/ui/card";

const QUOTES = [
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Strength does not come from winning. Your struggles develop your strengths.", author: "Arnold Schwarzenegger" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "Willpower is a muscle. The more you use it, the stronger it gets.", author: "Unknown" },
  { text: "You will never always be motivated. You have to learn to be disciplined.", author: "Unknown" },
  { text: "The pain of discipline is nothing like the pain of disappointment.", author: "Justin Langer" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
];

const InspirationQuote = () => {
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  return (
    <Card className="p-4 border-border/50 bg-card text-center">
      <p className="text-base italic text-foreground leading-relaxed">"{quote.text}"</p>
      <p className="text-xs text-muted-foreground mt-2">— {quote.author}</p>
    </Card>
  );
};

export default InspirationQuote;
