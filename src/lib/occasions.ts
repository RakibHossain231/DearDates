export interface OccasionItem {
  id: string;
  label: string;
  emoji: string;
  categoryName: string;
}

export const OCCASIONS: OccasionItem[] = [
  { id: "BIRTHDAY", emoji: "🎂", label: "Birthday Celebration", categoryName: "Birthday" },
  { id: "ANNIVERSARY", emoji: "💍", label: "Wedding / Anniversary", categoryName: "Anniversary" },
  { id: "NEW_YEAR", emoji: "🎆", label: "New Year Celebration", categoryName: "New Year" },
  { id: "EID_FITR", emoji: "🌙", label: "Eid-ul-Fitr Mubarak", categoryName: "Eid-ul-Fitr" },
  { id: "EID_ADHA", emoji: "🕋", label: "Eid-ul-Adha Mubarak", categoryName: "Eid-ul-Adha" },
  { id: "DIWALI", emoji: "🪔", label: "Diwali / Deepavali", categoryName: "Diwali" },
  { id: "CHRISTMAS", emoji: "🎄", label: "Christmas Celebration", categoryName: "Christmas" },
  { id: "VALENTINE", emoji: "❤️", label: "Valentine's Day / Love Note", categoryName: "Valentine" },
  { id: "GRADUATION", emoji: "🎓", label: "Graduation & Academic Milestone", categoryName: "Graduation" },
  { id: "JOB_PROMOTION", emoji: "💼", label: "Job Promotion / Career Win", categoryName: "Promotion" },
  { id: "NEW_BORN", emoji: "👶", label: "Newborn Baby / Baby Shower", categoryName: "Newborn Baby" },
  { id: "HOUSEWARMING", emoji: "🏡", label: "Housewarming / New Home", categoryName: "Housewarming" },
  { id: "FRIENDSHIP", emoji: "🤝", label: "Friendship Day", categoryName: "Friendship" },
  { id: "PARENTS_DAY", emoji: "💐", label: "Mother's Day / Father's Day", categoryName: "Parents Day" },
  { id: "GET_WELL", emoji: "🩹", label: "Get Well Soon / Fast Recovery", categoryName: "Get Well" },
  { id: "THANK_YOU", emoji: "🙏", label: "Thank You / Appreciation", categoryName: "Thank You" },
  { id: "CUSTOM", emoji: "🌟", label: "Special Event / Custom", categoryName: "Special Celebration" },
];

export function getOccasionLabel(id: string): string {
  const match = OCCASIONS.find((o) => o.id === id);
  if (match) return `${match.emoji} ${match.label}`;
  return `🎉 ${id}`;
}

export function getOccasionEmoji(id: string): string {
  const match = OCCASIONS.find((o) => o.id === id);
  return match ? match.emoji : "🎉";
}
