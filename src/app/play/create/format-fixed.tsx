// Helper function to convert 12-hour with AM/PM to 24-hour format
    const convert12To24 = (hour12: string, period: 'AM' | 'PM') => {
        let hour = parseInt(hour12);
        if (period === 'PM' && hour !== 12) {
            hour += 12;
        }
        if (period === 'AM' && hour === 12) {
            hour = 0;
        }
        return `${hour.toString().padStart(2, '0')}:00`;
    };

    // Helper function to convert 24-hour time to 12-hour format
