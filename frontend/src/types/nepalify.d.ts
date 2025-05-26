declare module 'nepalify' {
  interface NepalifyInstance {
    isEnabled(): boolean;
    enable(): void;
    disable(): void;
  }
  
  const nepalify: {
    format(text: string, options?: { layout?: string }): string;
    availableLayouts(): string[];
    interceptElementById(id: string, options?: { layout?: string; enable?: boolean }): NepalifyInstance;
  };
  
  export default nepalify;
} 