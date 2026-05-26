'use client';

import OrganizerLoginForm from '@/components/organizer/OrganizerLoginForm';

export default function LoginPage() {
    return (
        <OrganizerLoginForm
            vertical="events"
            setupPath="/list-your-events/setup"
            signinPath="/list-your-events/Signin"
        />
    );
}
