import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import LinesNumber from "@/components/layout/lines-numbers";
import Sidebar from "@/components/layout/sidebar";
import Terminal from "@/components/layout/terminal";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col size-full">
      <Header />
      <div className="flex size-full">
        <Sidebar />
      <ResizablePanelGroup direction="vertical" className="size-full">
        <ResizablePanel>
          <div className="flex flex-1">
            <LinesNumber />
            <div className="flex flex-1">{children}</div>
          </div>
          <Footer />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>
          <Terminal />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}