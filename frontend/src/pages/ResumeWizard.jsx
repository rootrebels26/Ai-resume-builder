import React from 'react';
import { useResume } from '../context/ResumeContext';
import { WizardProgress } from '../components/wizard/WizardProgress';
import { Step1TemplateSelection } from './wizard/Step1TemplateSelection';
import { Step2TargetJob } from './wizard/Step2TargetJob';
import { Step3CreationMethod } from './wizard/Step3CreationMethod';
import { Step4ResumeInformation } from './wizard/Step4ResumeInformation';
import { Step5AIOptimization } from './wizard/Step5AIOptimization';
import { Step6ATSAudit } from './wizard/Step6ATSAudit';
import { Step7FinalResume } from './wizard/Step7FinalResume';

export function ResumeWizard() {
  const { currentStep, setWizardStep, nextStep, prevStep } = useResume();

  return (
    <div className="flex-1 flex flex-col bg-slate-100 min-h-screen">
      {/* Top 7-Step Wizard Progress Bar */}
      <WizardProgress />

      {/* Dynamic Step View Container */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {currentStep === 1 && (
          <Step1TemplateSelection onNext={nextStep} />
        )}

        {currentStep === 2 && (
          <Step2TargetJob onNext={nextStep} onPrev={prevStep} />
        )}

        {currentStep === 3 && (
          <Step3CreationMethod onNext={nextStep} onPrev={prevStep} />
        )}

        {currentStep === 4 && (
          <Step4ResumeInformation onNext={nextStep} onPrev={prevStep} />
        )}

        {currentStep === 5 && (
          <Step5AIOptimization onNext={nextStep} onPrev={prevStep} />
        )}

        {currentStep === 6 && (
          <Step6ATSAudit onNext={nextStep} onPrev={prevStep} />
        )}

        {currentStep === 7 && (
          <Step7FinalResume onPrev={prevStep} />
        )}
      </div>
    </div>
  );
}
