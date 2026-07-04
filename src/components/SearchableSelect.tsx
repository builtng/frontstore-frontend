'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
  prefixIcon?: React.ReactNode;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  disabled = false,
  style = {},
  className = '',
  prefixIcon,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset state when opening/closing
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    } else {
      setActiveIndex(0);
      // Focus search input after transition/open
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (opt.sublabel && opt.sublabel.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Keep activeIndex within bounds when filtered results change
  useEffect(() => {
    setActiveIndex(0);
  }, [searchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
      case 'Tab':
        setIsOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (filteredOptions.length > 0) {
          setActiveIndex(prev => (prev + 1) % filteredOptions.length);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (filteredOptions.length > 0) {
          setActiveIndex(prev => (prev - 1 + filteredOptions.length) % filteredOptions.length);
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredOptions.length > 0 && activeIndex >= 0 && activeIndex < filteredOptions.length) {
          onChange(filteredOptions[activeIndex].value);
          setIsOpen(false);
        }
        break;
      default:
        break;
    }
  };

  // Scroll active item into view inside the dropdown list container
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeEl = listRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        const listHeight = listRef.current.clientHeight;
        const activeTop = activeEl.offsetTop;
        const activeHeight = activeEl.clientHeight;
        const currentScroll = listRef.current.scrollTop;

        if (activeTop + activeHeight > currentScroll + listHeight) {
          listRef.current.scrollTop = activeTop + activeHeight - listHeight;
        } else if (activeTop < currentScroll) {
          listRef.current.scrollTop = activeTop;
        }
      }
    }
  }, [activeIndex, isOpen]);

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      style={{
        position: 'relative',
        width: '100%',
        ...style
      }}
      className={`searchable-select-container ${className}`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '12px 14px',
          background: 'var(--surface)',
          border: isOpen ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
          borderRadius: 'var(--r-md)',
          fontSize: '14.5px',
          color: 'var(--text)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.65 : 1,
          outline: 'none',
          boxShadow: isOpen ? '0 0 0 3px var(--primary-glow)' : 'none',
          transition: 'all var(--t-fast) var(--ease)',
          textAlign: 'left',
          fontWeight: 500,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
          {prefixIcon && (
            <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center' }}>{prefixIcon}</span>
          )}
          {selectedOption?.icon && (
            <span style={{ flexShrink: 0, display: 'inline-flex' }}>{selectedOption.icon}</span>
          )}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: selectedOption ? 600 : 500 }}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <ChevronDown
          size={16}
          style={{
            color: 'var(--text-muted)',
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform var(--t-normal) var(--ease)',
            marginLeft: '8px',
            flexShrink: 0
          }}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: 'var(--surface)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--r-lg)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 9999,
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            animation: 'slideDown var(--t-fast) var(--ease) both',
          }}
        >
          {/* Search Box Input */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '12px',
                color: 'var(--text-faint)',
                pointerEvents: 'none'
              }}
            />
            <input
              ref={inputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%',
                padding: '10px 12px 10px 34px',
                background: 'var(--bg-2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)',
                fontSize: '13px',
                color: 'var(--text)',
                outline: 'none',
                transition: 'border-color var(--t-fast) var(--ease)',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery('');
                }}
                style={{
                  position: 'absolute',
                  right: '10px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-faint)',
                  cursor: 'pointer',
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Options list container */}
          <div
            ref={listRef}
            style={{
              maxHeight: '180px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, i) => {
                const isSelected = opt.value === value;
                const isActive = i === activeIndex;
                
                let background = 'transparent';
                let color = 'var(--text)';
                
                if (isSelected) {
                  background = 'var(--primary-light)';
                  color = 'var(--primary)';
                } else if (isActive) {
                  background = 'var(--bg-2)';
                }

                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '10px 12px',
                      background: background,
                      border: 'none',
                      borderRadius: 'var(--r-md)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: color,
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '13.5px',
                      transition: 'background var(--t-fast) var(--ease)',
                    }}
                    onMouseEnter={() => setActiveIndex(i)}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                      {opt.icon && <span style={{ flexShrink: 0, display: 'inline-flex' }}>{opt.icon}</span>}
                      <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {opt.label}
                        </span>
                        {opt.sublabel && (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                            {opt.sublabel}
                          </span>
                        )}
                      </span>
                    </span>
                    {isSelected && <Check size={14} style={{ color: 'var(--primary)', flexShrink: 0, marginLeft: 8 }} />}
                  </button>
                );
              })
            ) : (
              <div style={{ padding: '12px', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
                No matches found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
