import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
// import NotFound from "@/pages/not-found";
import FormBuilder from "./pages/FormBuilder";
import { FormBuilderProvider } from "./context/FormBuilderContext";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

// Initialize the drag tracking variables
window.lastDragX = 0;
window.lastDragY = 0;

function Router() {
  return (
    <Switch>
      <Route path="/" component={FormBuilder} />
      {/* <Route component={NotFound} /> */}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DndProvider backend={HTML5Backend}>
          <FormBuilderProvider>
            <Toaster />
            <Router />
          </FormBuilderProvider>
        </DndProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
