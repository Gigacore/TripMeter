import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Section {
  id: string;
  title: string;
}

interface DashboardNavProps {
  activeSection: string | null;
  sections: Section[];
}

const DashboardNav: React.FC<DashboardNavProps> = ({ activeSection, sections }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Card className="sticky top-4">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-2">Dashboard Sections</h3>
        <ul className="space-y-2">
          {sections.map(section => (
            <li key={section.id} className="relative">
              <a
                href={`#${section.id}`}
                onClick={(e) => handleClick(e, section.id)}
                className={cn(
                  "text-sm text-muted-foreground hover:text-foreground transition-all duration-200 ease-in-out",
                  "flex items-center pl-4 py-1",
                  activeSection === section.id && "text-foreground font-semibold"
                )}
              >
                <span className={cn(
                  "absolute left-0 h-full w-0.5 bg-primary transition-all duration-200 ease-in-out",
                  activeSection === section.id ? "scale-y-100" : "scale-y-0"
                )}></span>
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default DashboardNav;
