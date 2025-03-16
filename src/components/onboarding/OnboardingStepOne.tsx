
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Heart } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface OnboardingStepOneProps {
  fullName: string;
  setFullName: (value: string) => void;
  partnerName: string;
  setPartnerName: (value: string) => void;
  partnerEmail: string;
  setPartnerEmail: (value: string) => void;
  anniversaryDate: Date | null;
  setAnniversaryDate: (date: Date | null) => void;
}

export function OnboardingStepOne({
  fullName,
  setFullName,
  partnerName,
  setPartnerName,
  partnerEmail,
  setPartnerEmail,
  anniversaryDate,
  setAnniversaryDate
}: OnboardingStepOneProps) {
  const [useYearSelector, setUseYearSelector] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("");
  
  // Generate year options (current year back to 1950)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1949 }, (_, i) => (currentYear - i).toString());
  
  // Generate month options
  const months = [
    { value: "0", label: "January" },
    { value: "1", label: "February" },
    { value: "2", label: "March" },
    { value: "3", label: "April" },
    { value: "4", label: "May" },
    { value: "5", label: "June" },
    { value: "6", label: "July" },
    { value: "7", label: "August" },
    { value: "8", label: "September" },
    { value: "9", label: "October" },
    { value: "10", label: "November" },
    { value: "11", label: "December" }
  ];
  
  // Generate day options (1-31)
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  
  // Update the date when year/month/day selectors change
  useEffect(() => {
    if (selectedYear && selectedMonth && selectedDay) {
      const year = parseInt(selectedYear);
      const month = parseInt(selectedMonth);
      const day = parseInt(selectedDay);
      
      // Create new date and validate it (handle cases like Feb 30)
      const newDate = new Date(year, month, day);
      
      // Check if the date is valid by ensuring day hasn't been adjusted by JS Date normalization
      if (newDate.getDate() === day) {
        setAnniversaryDate(newDate);
      }
    }
  }, [selectedYear, selectedMonth, selectedDay, setAnniversaryDate]);
  
  // Update selector values when date changes from calendar
  useEffect(() => {
    if (anniversaryDate) {
      setSelectedYear(anniversaryDate.getFullYear().toString());
      setSelectedMonth(anniversaryDate.getMonth().toString());
      setSelectedDay(anniversaryDate.getDate().toString());
    }
  }, [anniversaryDate]);
  
  return (
    <div className="space-y-6">
      <div className="text-center p-4">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
          <Heart className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Welcome to Sparq Connect!</h2>
        <p className="text-muted-foreground">
          Let's set up your profile to make the most of your relationship journey.
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="full-name">Your Full Name</Label>
          <div className="mt-1.5">
            <Input
              id="full-name"
              type="text"
              placeholder="Your name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="partner-name">Your Partner's Name (Optional)</Label>
          <div className="mt-1.5">
            <Input
              id="partner-name"
              type="text"
              placeholder="Partner's name"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="partner-email">Partner's Email Address (Optional)</Label>
          <div className="mt-1.5">
            <Input
              id="partner-email"
              type="email"
              placeholder="partner@example.com"
              value={partnerEmail}
              onChange={(e) => setPartnerEmail(e.target.value)}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-1.5">
            We'll send them an invitation to join you on your relationship journey.
          </p>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <Label htmlFor="anniversary-date">Anniversary Date (Optional)</Label>
            <button 
              type="button" 
              className="text-sm text-primary hover:underline"
              onClick={() => setUseYearSelector(!useYearSelector)}
            >
              {useYearSelector ? "Use Calendar Picker" : "Use Year Selector"}
            </button>
          </div>
          
          {useYearSelector ? (
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Select 
                  value={selectedMonth} 
                  onValueChange={setSelectedMonth}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(month => (
                      <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select 
                  value={selectedDay} 
                  onValueChange={setSelectedDay}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map(day => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select 
                  value={selectedYear} 
                  onValueChange={setSelectedYear}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {years.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="mt-1.5">
              <DatePicker
                date={anniversaryDate}
                setDate={setAnniversaryDate}
                placeholder="Select date"
              />
            </div>
          )}
          <p className="text-sm text-muted-foreground mt-1.5">
            We'll help you celebrate important milestones.
          </p>
        </div>
      </div>
    </div>
  );
}
