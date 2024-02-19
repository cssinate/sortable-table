import React from "react";
import type { AriaButtonProps } from 'react-aria';
import { useButton } from 'react-aria';
import { useRef } from 'react';

export const IconButton = (props: AriaButtonProps) => {
    const ref = useRef<HTMLButtonElement>(null);
    const { buttonProps } = useButton(props, ref);
    const { children } = props;

    return (
        <button className={`iconButton ${buttonProps.disabled ? `iconButton--disabled` : ''}`} {...buttonProps} ref={ref}>
            {children}
        </button>
    );
}