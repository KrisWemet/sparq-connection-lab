
import { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  footer?: ReactNode;
}

export function AuthLayout({ 
  children, 
  title, 
  description, 
  footer 
}: AuthLayoutProps) {
  return (
    <div className="flex flex-col h-screen justify-center items-center px-4 bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Sparq Connect</h1>
          <p className="text-muted-foreground mt-2">Strengthen your relationship with meaningful goals</p>
        </div>
        
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            {children}
          </CardContent>
          {footer && (
            <CardFooter className="flex justify-center">
              {footer}
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
