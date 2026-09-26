'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * The product's select. On a mouse it opens a styled listbox (Radix Select: keyboard, typeahead,
 * screen readers and collision-aware positioning come with it); on a touch screen it is the
 * platform's own picker, which is easier to use with a thumb, dressed in the same trigger.
 *
 * API mirrors a controlled native select with an options array, so migrating is mechanical:
 *   <Select value={v} onValueChange={setV} options={[{ value: 'a', label: 'A' }]} />
 * An empty-string value is allowed (Radix forbids it; it is mapped internally).
 */

export interface SelectOption {
  value: string;
  label: React.ReactNode;
  /** Plain text for the native picker and typeahead when `label` is not a string. */
  textValue?: string;
  description?: React.ReactNode;
  /** Leading visual: an icon, a status dot, a logo. */
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SelectGroup {
  label: React.ReactNode;
  options: SelectOption[];
}

type Options = (SelectOption | SelectGroup)[];

export interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: Options;
  placeholder?: React.ReactNode;
  size?: 'sm' | 'md';
  disabled?: boolean;
  id?: string;
  name?: string;
  required?: boolean;
  className?: string;
  /** Accessible name when there is no <label htmlFor>. */
  'aria-label'?: string;
  title?: string;
  /** Render the trigger's value in the mono face (versions, regions, hostnames). */
  mono?: boolean;
}

const EMPTY = '__pushify_empty__';
const toRadix = (v: string) => (v === '' ? EMPTY : v);
const fromRadix = (v: string) => (v === EMPTY ? '' : v);

const isGroup = (o: SelectOption | SelectGroup): o is SelectGroup => 'options' in o;
const flat = (options: Options): SelectOption[] => options.flatMap((o) => (isGroup(o) ? o.options : [o]));
const text = (o: SelectOption) => o.textValue ?? (typeof o.label === 'string' ? o.label : o.value);

/** True on devices whose main pointer is a finger. Server and first client render agree (false). */
function useCoarsePointer() {
  return React.useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia('(pointer: coarse)');
      mq.addEventListener('change', cb);
      return () => mq.removeEventListener('change', cb);
    },
    () => window.matchMedia('(pointer: coarse)').matches,
    () => false
  );
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder,
  size = 'md',
  disabled,
  id,
  name,
  required,
  className,
  title,
  mono,
  ...rest
}: SelectProps) {
  const coarse = useCoarsePointer();
  const all = flat(options);
  // Like a native select: a value that matches no option shows the first option (until the caller
  // settles its value), rather than an empty box — unless there is a placeholder to show instead.
  const current =
    all.find((o) => o.value === value) ?? (placeholder === undefined ? all.find((o) => !o.disabled) : undefined);
  const triggerClass = cn('ui-select-trigger', size === 'sm' && 'is-sm', mono && 'is-mono', className);

  if (coarse) {
    return (
      <span className={cn(triggerClass, 'is-native')} data-disabled={disabled || undefined}>
        <span className="ui-select-value">
          {current?.icon}
          <span className="truncate">{current ? current.label : placeholder}</span>
        </span>
        <ChevronDown className="ui-select-chevron" aria-hidden />
        <select
          id={id}
          name={name}
          required={required}
          value={value}
          disabled={disabled}
          title={title}
          aria-label={rest['aria-label']}
          onChange={(e) => onValueChange(e.target.value)}
          className="ui-select-native"
        >
          {placeholder !== undefined && !current && (
            <option value="" disabled hidden>
              {typeof placeholder === 'string' ? placeholder : ''}
            </option>
          )}
          {options.map((o, i) =>
            isGroup(o) ? (
              <optgroup key={i} label={typeof o.label === 'string' ? o.label : ''}>
                {o.options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {text(opt)}
                  </option>
                ))}
              </optgroup>
            ) : (
              <option key={o.value} value={o.value} disabled={o.disabled}>
                {text(o)}
              </option>
            )
          )}
        </select>
      </span>
    );
  }

  return (
    <SelectPrimitive.Root
      value={current ? toRadix(current.value) : undefined}
      onValueChange={(v) => onValueChange(fromRadix(v))}
      disabled={disabled}
      name={name}
      required={required}
    >
      <SelectPrimitive.Trigger id={id} className={triggerClass} aria-label={rest['aria-label']} title={title}>
        <span className="ui-select-value">
          {current?.icon}
          <span className="truncate">
            <SelectPrimitive.Value placeholder={placeholder}>{current?.label}</SelectPrimitive.Value>
          </span>
        </span>
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="ui-select-chevron" aria-hidden />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        {/* dash-app: the portal renders outside the dashboard shell, so bring its tokens along. */}
        <SelectPrimitive.Content
          className="dash-app ui-select-content"
          position="popper"
          sideOffset={6}
          collisionPadding={12}
        >
          <SelectPrimitive.ScrollUpButton className="ui-select-scroll">
            <ChevronUp className="w-3.5 h-3.5" />
          </SelectPrimitive.ScrollUpButton>
          <SelectPrimitive.Viewport className="ui-select-viewport">
            {options.map((o, i) =>
              isGroup(o) ? (
                <SelectPrimitive.Group key={i}>
                  <SelectPrimitive.Label className="ui-select-label">{o.label}</SelectPrimitive.Label>
                  {o.options.map((opt) => (
                    <Item key={opt.value} option={opt} />
                  ))}
                </SelectPrimitive.Group>
              ) : (
                <Item key={o.value} option={o} />
              )
            )}
          </SelectPrimitive.Viewport>
          <SelectPrimitive.ScrollDownButton className="ui-select-scroll">
            <ChevronDown className="w-3.5 h-3.5" />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

function Item({ option }: { option: SelectOption }) {
  return (
    <SelectPrimitive.Item
      value={toRadix(option.value)}
      disabled={option.disabled}
      textValue={text(option)}
      className="ui-select-item"
    >
      {option.icon && <span className="ui-select-item-icon">{option.icon}</span>}
      <span className="min-w-0 flex-1">
        <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
        {option.description && <span className="ui-select-item-desc">{option.description}</span>}
      </span>
      <SelectPrimitive.ItemIndicator className="ui-select-check">
        <Check className="w-3.5 h-3.5" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}
