import React, { useEffect } from 'react';
import { useSearchFieldState } from 'react-stately';
import type { AriaSearchFieldProps } from 'react-aria';
import { useSearchField, VisuallyHidden } from 'react-aria';
import { useDebounceValue } from 'usehooks-ts';
import { IconSearch } from 'components/icons';

export const SearchField = ({ debounceDelay = 150, defaultValue, onChange, searchTopic, ...props }: Omit<AriaSearchFieldProps, 'value' | 'label'> & { debounceDelay?: number, searchTopic?: string; }) => {
    const label = searchTopic ? `Search for ${searchTopic}` : 'Search';

    const [debouncedValue, setValue] = useDebounceValue(defaultValue, debounceDelay);

    useEffect(() => {
        console.log('debouncedValue', debouncedValue);
        onChange?.(debouncedValue || '');
    }, [debouncedValue, onChange]);

    const state = useSearchFieldState({ ...props, value: undefined, defaultValue, onChange: setValue });
    const ref = React.useRef<HTMLInputElement>(null);
    const { labelProps, inputProps } = useSearchField({ ...props, value: undefined, defaultValue, label, onChange: setValue }, state, ref);

    return (
        <div className="searchField">
            <IconSearch />
            <VisuallyHidden><label {...labelProps}>{label}</label></VisuallyHidden>
            <input {...inputProps} ref={ref} placeholder={label} />
        </div>
    );
}