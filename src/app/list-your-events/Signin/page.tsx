'use client';

import OrganizerSigninForm from '@/components/organizer/OrganizerSigninForm';

export default function SignupPage() {
    return (
        <OrganizerSigninForm
            vertical="events"
            setupPath="/list-your-events/setup"
            loginPath="/list-your-events/Login"
        />
    );
}
