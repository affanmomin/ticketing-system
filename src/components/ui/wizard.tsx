import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WizardStep {
  id: string;
  title: string;
  description?: string;
  component: React.ReactNode;
}

interface WizardProps {
  steps: WizardStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onFinish?: () => void;
  canProceed?: boolean;
  isLoading?: boolean;
}

export function Wizard({
  steps,
  currentStep,
  onStepChange,
  onNext,
  onPrevious,
  onFinish,
  canProceed = true,
  isLoading = false,
}: WizardProps) {
  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onFinish?.();
    } else {
      onNext?.();
      onStepChange(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      onPrevious?.();
      onStepChange(currentStep - 1);
    }
  };

  return (
    <div className="space-y-4">
      {/* Progress Indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs font-medium text-foreground">
              {currentStepData.title}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                index <= currentStep ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
        {currentStepData.description && (
          <p className="text-xs text-muted-foreground">
            {currentStepData.description}
          </p>
        )}
      </div>

      {/* Step Content */}
      <div>{currentStepData.component}</div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-3 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={isFirstStep || isLoading}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button size="sm" onClick={handleNext} disabled={!canProceed || isLoading}>
          {isLoading ? (
            "Processing..."
          ) : isLastStep ? (
            "Create Ticket"
          ) : (
            <>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
