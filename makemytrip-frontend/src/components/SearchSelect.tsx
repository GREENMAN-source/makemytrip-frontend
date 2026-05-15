import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"


export function SearchSelect({ options, placeholder, value, onChange, icon, subtitle }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredOptions = options.filter((option:any) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={wrapperRef} className="relative min-w-0">
      <div
        className="min-h-[72px] cursor-pointer rounded-lg border p-3 hover:border-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-2">
          {icon}
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-500 truncate">{placeholder}</div>
            <Input
              type="text"
              value={value || searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                onChange('');
              }}
              className="font-semibold w-full bg-transparent border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder={placeholder}
            />
            <div className="text-xs text-gray-400 truncate">{subtitle}</div>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full min-w-[220px] rounded-md border border-gray-300 bg-white shadow-lg">
          <ScrollArea className="h-64">
            {filteredOptions.length > 0 ? filteredOptions.map((option:any) => (
              <Button
                key={option.value}
                className="w-full justify-start whitespace-normal text-left font-normal"
                variant="ghost"
                onClick={() => {
                  onChange(option.value);
                  setSearchTerm('');
                  setIsOpen(false);
                }}
              >
                {option.label}
              </Button>
            )) : (
              <div className="p-3 text-sm text-gray-500">No options found</div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
