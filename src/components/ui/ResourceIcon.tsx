import { FileText, Video, Link as LinkIcon, StickyNote } from "lucide-react";

const iconMap = {
  PDF: { icon: FileText, color: "text-red-500" },
  VIDEO: { icon: Video, color: "text-purple-500" },
  LINK: { icon: LinkIcon, color: "text-blue-500" },
  NOTES: { icon: StickyNote, color: "text-amber-500" },
} as const;

export function ResourceIcon({
  type,
  size = 16,
}: {
  type: string;
  size?: number;
}) {
  const config = iconMap[type as keyof typeof iconMap];
  if (!config) return <span className="text-xs text-gray-400 font-medium">{type}</span>;
  const Icon = config.icon;
  return <Icon size={size} className={config.color} />;
}

export function resourceBgColor(type: string): string {
  const colors: Record<string, string> = {
    PDF: "bg-red-50",
    VIDEO: "bg-purple-50",
    LINK: "bg-blue-50",
    NOTES: "bg-amber-50",
  };
  return colors[type] || "bg-gray-50";
}
