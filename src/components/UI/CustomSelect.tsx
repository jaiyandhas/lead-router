'use client'

import { useState, useRef, useEffect, useId } from 'react'

export interface SelectOption {
  value: string
  label: string
}

interface CustomSelectProps {
  id?: string
  label?: string
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
}

export default function CustomSelect({
  id,
  options,
  value,
  onChange,
  placeholder = 'Select option',
  error,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const autoId = useId()
  const selectId = id || autoId

  const selectedOption = options.find((opt) => opt.value === value)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setIsOpen(false)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsOpen((prev) => !prev)
    }
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <button
        id={selectId}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`field-input custom-select-trigger ${error ? 'has-error' : ''}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
          textAlign: 'left',
          color: selectedOption ? 'var(--text-primary)' : 'var(--text-muted)',
          borderColor: isOpen ? 'var(--accent)' : undefined,
          boxShadow: isOpen ? '0 0 0 4px rgba(0, 113, 227, 0.12)' : undefined,
        }}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        {/* Pure CSS Triangle Arrow — NO SVG icon */}
        <span
          style={{
            display: 'inline-block',
            width: 0,
            height: 0,
            marginLeft: '0.75rem',
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '5px solid #86868b',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            flexShrink: 0,
          }}
        />
      </button>

      {/* Custom Dropdown Listbox */}
      {isOpen && (
        <ul
          role="listbox"
          aria-labelledby={selectId}
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 50,
            margin: 0,
            padding: '0.375rem',
            background: '#ffffff',
            border: '1px solid #d2d2d7',
            borderRadius: '0.875rem',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)',
            listStyle: 'none',
            maxHeight: '220px',
            overflowY: 'auto',
          }}
        >
          {options.map((option) => {
            const isSelected = option.value === value
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                style={{
                  padding: '0.75rem 1rem',
                  fontSize: '0.9375rem',
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? '#0071e3' : '#1d1d1f',
                  background: isSelected ? '#e8f2ff' : 'transparent',
                  borderRadius: '0.625rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background 0.15s',
                  userSelect: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = '#f5f5f7'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <span>{option.label}</span>
                {isSelected && (
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0071e3' }}>
                    Selected
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
