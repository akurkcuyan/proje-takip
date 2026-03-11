"use client";
import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(initialValue);
    const [isLoaded, setIsLoaded] = useState(false);

    // Initial load from localStorage
    useEffect(() => {
        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                setStoredValue(JSON.parse(item));
            }
            setIsLoaded(true);
        } catch (error) {
            console.log(error);
            setIsLoaded(true);
        }
    }, [key]);

    // Save to localStorage whenever storedValue changes
    useEffect(() => {
        if (!isLoaded) return;
        try {
            window.localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.log(error);
        }
    }, [key, storedValue, isLoaded]);

    return [storedValue, setStoredValue];
}
