'use client';

import { Button, Card } from '@heroui/react';

export default function HeroTest() {
  return (
    <div className="p-4">
      <Card className="max-w-md mx-auto p-6">
        <h2 className="text-xl font-bold mb-4">HeroUI Test</h2>
        <p className="mb-4">This is a test of HeroUI with Tailwind CSS v4</p>
        <Button>Click Me</Button>
      </Card>
    </div>
  );
}
