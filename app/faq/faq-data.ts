import { Gauge, Sprout, Users, type LucideIcon } from "lucide-react";

export type FaqItem = { id: string; q: string; a: string };

export type FaqGroup = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  items: FaqItem[];
};

export const faqGroups: FaqGroup[] = [
  {
    id: "getting-started",
    title: "Getting started",
    description: "What you need, and how to set up your first habits.",
    icon: Sprout,
    items: [
      {
        id: "install",
        q: "Do I need to install an app?",
        a: "No. Compete runs in your browser. It's built for phones first and works just as well on a laptop.",
      },
      {
        id: "habit-types",
        q: "What kind of habits can I track?",
        a: "Anything you can mark as done or not done, like \"Go for a run\", \"Read 20 pages\" or \"No sugar\". You can also set a number target, like 8 glasses of water or 30 minutes, and count up through the day.",
      },
      {
        id: "how-many",
        q: "How many habits should I start with?",
        a: "Three to five is a good start. Your score is a percentage, so a short list you actually finish beats a long one you don't.",
      },
      {
        id: "solo",
        q: "Do I need friends to use it?",
        a: "No. On your own you still get your daily list, scores and streaks. Friends add the weekly leaderboard.",
      },
    ],
  },
  {
    id: "scores-and-streaks",
    title: "Scores and streaks",
    description: "How your day and your week are scored.",
    icon: Gauge,
    items: [
      {
        id: "score",
        q: "How is my score calculated?",
        a: "Each day, your score is the percentage of that day's scheduled habits you completed. Your weekly score is the average of your daily scores, and that's what the leaderboard ranks. Today joins the average once you hit 100% or the day ends, so checking off a habit never lowers your score.",
      },
      {
        id: "empty-days",
        q: "Do days with nothing scheduled count against me?",
        a: "No. If a habit only runs on weekdays, it isn't part of your weekend score.",
      },
      {
        id: "streaks",
        q: "How do streaks work?",
        a: "Every day you check in and hit your target adds one to your streak. Miss a day and it starts over.",
      },
      {
        id: "forgot",
        q: "What if I forget to check in?",
        a: "You can still log yesterday's habits. Anything older is locked, so nobody can fill in last week after the fact.",
      },
    ],
  },
  {
    id: "friends-and-competition",
    title: "Friends and competition",
    description: "Leaderboards, privacy and playing fair.",
    icon: Users,
    items: [
      {
        id: "add-friends",
        q: "How do I add friends?",
        a: "Search for their username or name on the Friends page and send a request. Once they accept, you'll both show up on each other's weekly leaderboard.",
      },
      {
        id: "privacy",
        q: "Can my friends see all my habits?",
        a: "Only what you allow. For each habit you choose whether friends can see its name. Hidden habits still count toward your score.",
      },
      {
        id: "fairness",
        q: "Isn't it unfair if someone has fewer habits?",
        a: "No. Everyone is scored on the share of their own habits they finish, so a longer list doesn't earn more points.",
      },
      {
        id: "reset",
        q: "When does the leaderboard reset?",
        a: "Every Monday, so everyone starts the new week from zero.",
      },
      {
        id: "challenges",
        q: "What are challenges?",
        a: "Someone picks one thing to stick to and a length (7 to 30 days), then invites friends. Everyone checks in once a day, and the standings show who kept it up the most.",
      },
    ],
  },
];
