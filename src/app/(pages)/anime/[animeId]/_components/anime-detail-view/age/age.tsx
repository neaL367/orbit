"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckIcon, XCircle } from "lucide-react";

export const Age = ({
  onVerified,
  onDeclined,
}: {
  onVerified: () => void;
  onDeclined: () => void;
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md p-8">
        <div className="flex items-center justify-center mb-6">
          <AlertCircle className="w-16 h-16 text-red-500" />
        </div>

        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Age Verification Required
        </h1>

        <p className="text-gray-300 text-center mb-6">
          This content contains adult material
        </p>

        <div className="mb-6">
          <p className="text-xl text-white text-center font-semibold">
            Are you 18 years or older?
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <div className="flex items-center gap-4">
            <Button onClick={onVerified} variant="secondary" className=" ">
              <CheckIcon className="w-5 h-5 inline mr-2" />
              Yes, I&apos;m 18+ 
            </Button>
            <Button onClick={onDeclined} variant="default" className=" ">
              <XCircle className="w-5 h-5 inline mr-2" />
              No, I&apos;m under 18
            </Button>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center mt-6">
          By clicking &quot;Yes&quot;, you confirm that you are of legal age to
          view adult content.
        </p>
      </Card>
    </div>
  );
};
