export interface CoursePlan {
  id: string;
  title: string;
  description: string;
  amount: number;
  badge: string | null;
}

export interface AppSettings {
  defaultTikkieUrl: string;
  coursePlans: CoursePlan[];
  academyName: string;
  supportEmail: string;
  currency: string;
  maintenanceMode: boolean;
  allowCustomTikkieUrl: boolean;
  updatedAt?: string | Date;
}

export const defaultSettings: AppSettings = {
  defaultTikkieUrl:
    process.env.NEXT_PUBLIC_DEFAULT_TIKKIE_URL ||
    "https://tikkie.me/pay/AlHimmah/fUKzY6Fc7DCaCYwSwfu38H",
  coursePlans: [
    {
      id: "fullstack",
      title: "Full-Stack Web Development",
      description: "Next.js, React, Node.js & MongoDB Certification",
      amount: 49.0,
      badge: "Most Popular",
    },
    {
      id: "ai-engineer",
      title: "AI & Machine Learning Track",
      description: "LLMs, Python, Prompting & Neural Networks",
      amount: 89.0,
      badge: "Trending",
    },
    {
      id: "cloud-devops",
      title: "Cloud Architecture & DevOps",
      description: "Docker, Kubernetes, AWS & CI/CD Pipelines",
      amount: 69.0,
      badge: null,
    },
  ],
  academyName: "ALH Academy",
  supportEmail: "info@alh-academy.nl",
  currency: "EUR",
  maintenanceMode: false,
  allowCustomTikkieUrl: true,
};
