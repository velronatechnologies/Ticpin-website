import React from 'react';

export default function ListYourEventsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen" style={{ backgroundColor: '#ffffffff' }}>
            {children}
        </div>
    );
}
