import { ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface SplitLayoutProps {
  leftPane: ReactNode;
  rightPane: ReactNode;
}

export function SplitLayout({ leftPane, rightPane }: SplitLayoutProps) {
  return (
    <div className="flex h-screen w-full flex-col md:flex-row overflow-hidden bg-background">
      {/* Left Pane: PDF Viewer / Input */}
      <div className="w-full md:w-1/2 h-full flex flex-col border-r bg-muted/10">
        <div className="flex-1 h-full overflow-hidden relative">
            {leftPane}
        </div>
      </div>

      {/* Right Pane: Analysis Results */}
      <div className="w-full md:w-1/2 h-full flex flex-col bg-background">
        <ScrollArea className="h-full w-full">
          <div className="p-6">
            {rightPane}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
